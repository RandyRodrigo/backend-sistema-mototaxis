import { AppDataSource } from '../config/appdatasource';
import { Programacion } from '../entities/programacion';
import { Turno } from '../entities/turno';
import { Paradero } from '../entities/paradero';
import { Asistencia } from '../entities/asistencia';
import { Moto } from '../entities/moto';
import { EstadoAuditoriaEnum } from '../enums/estado-auditoria.enums';
import { v4 as generarUUID } from 'uuid';

const programacionRepo = AppDataSource.getRepository(Programacion);
const turnoRepo = AppDataSource.getRepository(Turno);
const paraderoRepo = AppDataSource.getRepository(Paradero);
const asistenciaRepo = AppDataSource.getRepository(Asistencia);

/**
 * Genera programación de Comité 24 basada en orden de llegada a Mormones
 */
export const generarProgramacionComite24 = async (fecha: string): Promise<Programacion[]> => {
    console.log(`🚀 Generando Comité 24 para ${fecha}...`);

    // 1. Verificar que no exista programación de Comité 24 para esta fecha
    const paraderoComite24 = await paraderoRepo.findOne({
        where: { nombre: 'Comité 24' }
    });

    if (!paraderoComite24) {
        throw new Error('Paradero Comité 24 no encontrado');
    }

    const programacionExistente = await programacionRepo.count({
        where: {
            fecha,
            paradero: { idParadero: paraderoComite24.idParadero }
        }
    });

    if (programacionExistente > 0) {
        throw new Error(`Ya existe programación de Comité 24 para la fecha ${fecha}`);
    }

    // 2. Obtener asistencias de llegada a Mormones ordenadas por orden_llegada
    const paraderoMormones = await paraderoRepo.findOne({
        where: { nombre: 'Mormones' }
    });

    if (!paraderoMormones) {
        throw new Error('Paradero Mormones no encontrado');
    }

    const asistencias = await asistenciaRepo.find({
        where: {
            fecha,
            tipoMarcado: 'llegada',
            paradero: { idParadero: paraderoMormones.idParadero }
        },
        relations: ['moto'],
        order: {
            ordenLlegada: 'ASC'
        }
    });

    if (asistencias.length === 0) {
        throw new Error(`No hay asistencias registradas en Mormones para la fecha ${fecha}`);
    }

    console.log(`📋 ${asistencias.length} asistencias encontradas en Mormones`);

    // 3. Obtener turnos de Comité 24 para este día
    const diaSemana = obtenerDiaSemana(fecha);
    const turnosComite24 = await turnoRepo
        .createQueryBuilder('turno')
        .where('turno.nombre LIKE :nombre', { nombre: '%24%' })
        .andWhere('turno.idParadero = :idParadero', { idParadero: paraderoComite24.idParadero })
        .andWhere('turno.estadoAuditoria = :estado', { estado: EstadoAuditoriaEnum.ACTIVO })
        .getMany();

    // Filtrar por días de semana
    const turnosAplicables = turnosComite24.filter(turno => {
        if (!turno.diasSemana) return true;
        const dias = turno.diasSemana.toLowerCase().split(',').map(d => d.trim());
        return dias.includes(diaSemana);
    });

    if (turnosAplicables.length === 0) {
        throw new Error(`No hay turnos de Comité 24 configurados para ${diaSemana}`);
    }

    // Ordenar turnos por hora de inicio
    turnosAplicables.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

    console.log(`🕐 ${turnosAplicables.length} turnos de Comité 24 aplicables`);

    // 4. Asignar motos a turnos según orden de llegada
    const programaciones: Programacion[] = [];
    let indiceAsistencia = 0;

    for (const turno of turnosAplicables) {
        const cantidadRequerida = turno.cantidadMotos;

        for (let i = 0; i < cantidadRequerida && indiceAsistencia < asistencias.length; i++) {
            const asistencia = asistencias[indiceAsistencia];

            const programacion = programacionRepo.create({
                idProgramacion: generarUUID(),
                moto: asistencia.moto,
                paradero: paraderoComite24,
                turno: turno,
                fecha: fecha,
                ordenAsignacion: i + 1,
                esCompensacion: false,
                generadoAutomaticamente: true,
                estadoAuditoria: EstadoAuditoriaEnum.ACTIVO
            });

            programaciones.push(programacion);
            indiceAsistencia++;
        }
    }

    // 5. Guardar programaciones
    const programacionesGuardadas = await programacionRepo.save(programaciones);

    const turnosCompletos = turnosAplicables.filter((t, i) => {
        const asignadas = programacionesGuardadas.filter(p => p.turno.idTurno === t.idTurno).length;
        return asignadas === t.cantidadMotos;
    }).length;

    const turnosIncompletos = turnosAplicables.length - turnosCompletos;

    console.log(`✅ Comité 24 generado: ${programacionesGuardadas.length} asignaciones`);
    console.log(`   - Turnos completos: ${turnosCompletos}`);
    console.log(`   - Turnos incompletos: ${turnosIncompletos}`);

    if (turnosIncompletos > 0) {
        console.warn(`⚠️  Advertencia: ${turnosIncompletos} turnos quedaron incompletos por falta de asistencias`);
    }

    return programacionesGuardadas;
};

/**
 * Obtiene el día de la semana en español
 */
const obtenerDiaSemana = (fecha: string): string => {
    const fechaObj = new Date(fecha + 'T00:00:00');
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    return dias[fechaObj.getDay()];
};

/**
 * Elimina programación de Comité 24 para una fecha específica
 */
export const eliminarProgramacionComite24 = async (fecha: string): Promise<void> => {
    const paraderoComite24 = await paraderoRepo.findOne({
        where: { nombre: 'Comité 24' }
    });

    if (!paraderoComite24) {
        throw new Error('Paradero Comité 24 no encontrado');
    }

    await programacionRepo.delete({
        fecha,
        paradero: { idParadero: paraderoComite24.idParadero }
    });

    console.log(`🗑️  Programación de Comité 24 eliminada para ${fecha}`);
};
