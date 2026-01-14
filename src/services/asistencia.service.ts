import { AppDataSource } from '../config/appdatasource';
import { Asistencia } from '../entities/asistencia';
import { ConfiguracionAsistencia } from '../entities/configuracion-asistencia';
import { Programacion } from '../entities/programacion';
import { Paradero } from '../entities/paradero';
import { In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { obtenerFechaHoyPeru } from '../shared/date-utils';

const asistenciaRepo = AppDataSource.getRepository(Asistencia);
const programacionRepo = AppDataSource.getRepository(Programacion);
const configuracionRepo = AppDataSource.getRepository(ConfiguracionAsistencia);
const paraderoRepo = AppDataSource.getRepository(Paradero);

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @returns Distancia en metros
 */
export function calcularDistanciaHaversine(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371000; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
}

/**
 * Valida si el usuario está dentro del radio del paradero
 */
export async function validarUbicacionGPS(
    latUsuario: number,
    lonUsuario: number,
    idParadero: string
): Promise<{ dentroRadio: boolean; distancia: number }> {
    const paradero = await paraderoRepo.findOne({
        where: { idParadero }
    });

    if (!paradero) {
        throw new Error('Paradero no encontrado');
    }

    const distancia = calcularDistanciaHaversine(
        latUsuario,
        lonUsuario,
        paradero.lat,
        paradero.lng
    );

    const dentroRadio = distancia <= paradero.radioMetros;

    return { dentroRadio, distancia };
}

/**
 * Determina el estado de asistencia basado en la hora de marcado
 */
export async function determinarEstadoAsistencia(
    horaMarcado: Date,
    horaEsperada: string, // "HH:MM:SS"
    tipoMarcado: 'llegada' | 'salida'
): Promise<{
    estado: 'asistio' | 'tardanza' | 'falta';
    minutosDiferencia: number;
}> {
    // Obtener tolerancia de la BD
    const config = await configuracionRepo.findOne({
        where: { tipoMarcado }
    });

    const toleranciaMinutos = config?.toleranciaMinutos || 15;

    // Calcular hora esperada
    const [hora, minuto, segundo] = horaEsperada.split(':').map(Number);
    const fechaEsperada = new Date(horaMarcado);
    fechaEsperada.setHours(hora, minuto, segundo || 0, 0);

    // Calcular diferencia en minutos
    const diferenciaMs = horaMarcado.getTime() - fechaEsperada.getTime();
    const minutosDiferencia = Math.floor(diferenciaMs / 60000);

    // Determinar estado
    let estado: 'asistio' | 'tardanza' | 'falta';

    if (tipoMarcado === 'llegada') {
        if (minutosDiferencia <= 0) {
            estado = 'asistio'; // Llegó antes o a tiempo
        } else if (minutosDiferencia <= toleranciaMinutos) {
            estado = 'tardanza'; // Llegó tarde pero dentro de tolerancia
        } else {
            estado = 'falta'; // Llegó muy tarde
        }
    } else {
        // salida
        // Para salida, puede salir antes sin problema
        if (Math.abs(minutosDiferencia) <= toleranciaMinutos) {
            estado = 'asistio';
        } else if (minutosDiferencia < -toleranciaMinutos) {
            estado = 'tardanza'; // Salió muy temprano
        } else {
            estado = 'falta'; // Salió muy tarde
        }
    }

    return { estado, minutosDiferencia };
}

/**
 * Calcula el orden de llegada en un paradero para una fecha
 */
export async function calcularOrdenLlegada(
    fecha: string,
    idParadero: string
): Promise<number> {
    const count = await asistenciaRepo.count({
        where: {
            fecha,
            idParadero,
            tipoMarcado: 'llegada',
            estadoAsistencia: In(['asistio', 'tardanza'])
        }
    });

    return count + 1;
}

/**
 * Marca la asistencia de un usuario (llegada o salida)
 */
export async function marcarAsistencia(
    idUsuario: string,
    dto: {
        tipo_marcado: 'llegada' | 'salida';
        latitud: number;
        longitud: number;
        dispositivo?: string;
    },
    ipAddress: string
): Promise<Asistencia> {
    // 1. Obtener TODAS las programaciones del usuario para hoy (zona horaria Perú)
    const hoy = obtenerFechaHoyPeru();

    const programaciones = await programacionRepo.find({
        where: {
            moto: { usuario: { idUsuario } },
            fecha: hoy
        },
        relations: ['moto', 'moto.usuario', 'paradero', 'turno']
    });

    if (!programaciones || programaciones.length === 0) {
        throw new Error('No tienes programación para hoy');
    }

    // 2. Detectar en qué paradero está el usuario basándose en GPS
    let programacionActual: typeof programaciones[0] | null = null;
    let menorDistancia = Infinity;

    for (const prog of programaciones) {
        const distancia = calcularDistanciaHaversine(
            dto.latitud,
            dto.longitud,
            Number(prog.paradero.lat),
            Number(prog.paradero.lng)
        );

        // Si está dentro del radio y es la más cercana
        if (distancia <= prog.paradero.radioMetros && distancia < menorDistancia) {
            menorDistancia = distancia;
            programacionActual = prog;
        }
    }

    if (!programacionActual) {
        throw new Error(
            `No estás cerca de ninguno de tus paraderos asignados. ` +
            `Asegúrate de estar dentro del radio de: ${programaciones.map(p => p.paradero.nombre).join(', ')}`
        );
    }

    // 3. Verificar que no haya marcado ya este tipo para ESTA programación
    const marcadoExistente = await asistenciaRepo.findOne({
        where: {
            idProgramacion: programacionActual.idProgramacion,
            tipoMarcado: dto.tipo_marcado
        }
    });

    if (marcadoExistente) {
        throw new Error(`Ya marcaste ${dto.tipo_marcado} para este turno`);
    }

    // 2.5. Si es salida, verificar que haya marcado llegada exitosa
    if (dto.tipo_marcado === 'salida') {
        const marcadoLlegada = await asistenciaRepo.findOne({
            where: {
                idProgramacion: programacionActual.idProgramacion,
                tipoMarcado: 'llegada'
            }
        });

        if (!marcadoLlegada) {
            throw new Error('Debes marcar llegada antes de marcar salida');
        }

        if (marcadoLlegada.estadoAsistencia === 'falta') {
            throw new Error('No puedes marcar salida porque tu llegada fue marcada como falta');
        }

        // Validar que esté dentro del rango de tiempo para marcar salida
        const ahora = new Date();
        const [horaFin, minutoFin] = programacionActual.turno.horaFin.split(':').map(Number);
        const horaFinTurno = new Date(ahora);
        horaFinTurno.setHours(horaFin, minutoFin, 0, 0);

        // Obtener tolerancia de salida (30 minutos por defecto)
        const configSalida = await configuracionRepo.findOne({
            where: { tipoMarcado: 'salida' }
        });
        const toleranciaSalidaMinutos = configSalida?.toleranciaMinutos || 30;

        // Calcular tiempo mínimo permitido (tolerancia antes de la hora de fin)
        const tiempoMinimoSalida = new Date(horaFinTurno);
        tiempoMinimoSalida.setMinutes(tiempoMinimoSalida.getMinutes() - toleranciaSalidaMinutos);

        if (ahora < tiempoMinimoSalida) {
            const horasRestantes = Math.floor((tiempoMinimoSalida.getTime() - ahora.getTime()) / (1000 * 60 * 60));
            const minutosRestantes = Math.floor(((tiempoMinimoSalida.getTime() - ahora.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
            throw new Error(
                `Aún no puedes marcar salida. El turno termina a las ${programacionActual.turno.horaFin}. ` +
                `Puedes marcar desde las ${tiempoMinimoSalida.getHours().toString().padStart(2, '0')}:${tiempoMinimoSalida.getMinutes().toString().padStart(2, '0')}. ` +
                `Faltan ${horasRestantes}h ${minutosRestantes}min`
            );
        }
    }

    // 3. Validar ubicación GPS
    const { dentroRadio, distancia } = await validarUbicacionGPS(
        dto.latitud,
        dto.longitud,
        programacionActual.paradero.idParadero
    );

    if (!dentroRadio) {
        throw new Error(
            `Estás a ${distancia.toFixed(0)}m del paradero. ` +
            `Debes estar dentro de ${programacionActual.paradero.radioMetros}m`
        );
    }

    // 4. Validar ventana de tiempo permitida
    const ahora = new Date();
    const horaEsperada =
        dto.tipo_marcado === 'llegada'
            ? programacionActual.turno.horaInicio
            : programacionActual.turno.horaFin;

    // Obtener configuración de tolerancia
    const config = await configuracionRepo.findOne({
        where: { tipoMarcado: dto.tipo_marcado }
    });
    const toleranciaMinutos = config?.toleranciaMinutos || 15;

    // Calcular ventana de tiempo permitida
    const [hora, minuto] = horaEsperada.split(':').map(Number);
    const horaEsperadaDate = new Date(ahora);
    horaEsperadaDate.setHours(hora, minuto, 0, 0);

    const tiempoMinimo = new Date(horaEsperadaDate);
    const tiempoMaximo = new Date(horaEsperadaDate);

    if (dto.tipo_marcado === 'llegada') {
        // Para llegada: puede marcar desde 1 hora antes hasta tolerancia después
        tiempoMinimo.setHours(tiempoMinimo.getHours() - 1);
        tiempoMaximo.setMinutes(tiempoMaximo.getMinutes() + toleranciaMinutos);
    } else {
        // Para salida: puede marcar desde tolerancia antes hasta 1 hora después
        tiempoMinimo.setMinutes(tiempoMinimo.getMinutes() - toleranciaMinutos);
        tiempoMaximo.setHours(tiempoMaximo.getHours() + 1);
    }

    // Validar que esté dentro de la ventana
    if (ahora < tiempoMinimo) {
        const horasRestantes = Math.floor((tiempoMinimo.getTime() - ahora.getTime()) / (1000 * 60 * 60));
        const minutosRestantes = Math.floor(((tiempoMinimo.getTime() - ahora.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
        throw new Error(
            `Aún no puedes marcar ${dto.tipo_marcado}. El turno ${dto.tipo_marcado === 'llegada' ? 'inicia' : 'termina'} a las ${horaEsperada}. ` +
            `Puedes marcar desde las ${tiempoMinimo.getHours().toString().padStart(2, '0')}:${tiempoMinimo.getMinutes().toString().padStart(2, '0')}. ` +
            `Faltan ${horasRestantes}h ${minutosRestantes}min`
        );
    }

    if (ahora > tiempoMaximo) {
        throw new Error(
            `Ya no puedes marcar ${dto.tipo_marcado}. El turno ${dto.tipo_marcado === 'llegada' ? 'inició' : 'terminó'} a las ${horaEsperada}. ` +
            `La ventana para marcar cerró a las ${tiempoMaximo.getHours().toString().padStart(2, '0')}:${tiempoMaximo.getMinutes().toString().padStart(2, '0')}`
        );
    }

    // 5. Determinar estado de asistencia
    const { estado, minutosDiferencia } = await determinarEstadoAsistencia(
        new Date(),
        horaEsperada,
        dto.tipo_marcado
    );

    // 6. Calcular orden de llegada (solo para Mormones y llegada)
    let ordenLlegada = null;
    if (
        programacionActual.paradero.nombre === 'Mormones' &&
        dto.tipo_marcado === 'llegada'
    ) {
        ordenLlegada = await calcularOrdenLlegada(hoy, programacionActual.paradero.idParadero);
    }

    // 7. Guardar asistencia
    const asistencia = asistenciaRepo.create({
        idAsistencia: uuidv4(),
        idProgramacion: programacionActual.idProgramacion,
        idUsuario: programacionActual.moto.usuario.idUsuario,
        idMoto: programacionActual.moto.idMoto,
        idParadero: programacionActual.paradero.idParadero,
        idTurno: programacionActual.turno.idTurno,
        fecha: hoy,
        tipoMarcado: dto.tipo_marcado,
        horaMarcado: new Date(),
        horaEsperada,
        latitudMarcado: dto.latitud,
        longitudMarcado: dto.longitud,
        distanciaMetros: distancia,
        dentroRadio,
        estadoAsistencia: estado,
        minutosDiferencia,
        ordenLlegada,
        ipMarcado: ipAddress,
        dispositivo: dto.dispositivo
    });

    return await asistenciaRepo.save(asistencia);
}

/**
 * Obtiene la programación del usuario para hoy
 */
export async function obtenerMiProgramacionHoy(
    idUsuario: string
): Promise<Programacion[]> {
    const hoy = obtenerFechaHoyPeru();

    return await programacionRepo.find({
        where: {
            moto: { usuario: { idUsuario } },
            fecha: hoy
        },
        relations: ['moto', 'paradero', 'turno'],
        order: {
            turno: { horaInicio: 'ASC' }
        }
    });
}

/**
 * Obtiene el historial de asistencias de un usuario
 */
export async function obtenerHistorialAsistencias(
    idUsuario: string,
    desde?: string,
    hasta?: string
): Promise<Asistencia[]> {
    const query = asistenciaRepo
        .createQueryBuilder('a')
        .where('a.id_usuario = :idUsuario', { idUsuario })
        .leftJoinAndSelect('a.paradero', 'paradero')
        .leftJoinAndSelect('a.turno', 'turno')
        .leftJoinAndSelect('a.moto', 'moto')
        .orderBy('a.fecha', 'DESC')
        .addOrderBy('a.hora_marcado', 'DESC');

    if (desde) {
        query.andWhere('a.fecha >= :desde', { desde });
    }

    if (hasta) {
        query.andWhere('a.fecha <= :hasta', { hasta });
    }

    return await query.getMany();
}

/**
 * Marca faltas automáticas para turnos que ya terminaron
 */
export async function marcarFaltasAutomaticas(): Promise<number> {
    const ahora = new Date();
    const horaActual = `${ahora.getHours().toString().padStart(2, '0')}:00:00`;
    const hoy = obtenerFechaHoyPeru();

    console.log(
        `🚨 [ASISTENCIA] Marcando faltas automáticas - ${hoy} ${horaActual}`
    );

    // Buscar programaciones de turnos que ya terminaron
    const programaciones = await programacionRepo
        .createQueryBuilder('prog')
        .innerJoinAndSelect('prog.turno', 'turno')
        .innerJoinAndSelect('prog.moto', 'moto')
        .innerJoinAndSelect('moto.usuario', 'usuario')
        .innerJoinAndSelect('prog.paradero', 'paradero')
        .where('prog.fecha = :fecha', { fecha: hoy })
        .andWhere('turno.hora_fin < :horaActual', { horaActual })
        .getMany();

    let faltasMarcadas = 0;

    for (const prog of programaciones) {
        // Verificar si marcó llegada
        const marcadoLlegada = await asistenciaRepo.findOne({
            where: {
                idProgramacion: prog.idProgramacion,
                tipoMarcado: 'llegada'
            }
        });

        if (!marcadoLlegada) {
            // Marcar falta automática de llegada
            await asistenciaRepo.save({
                idAsistencia: uuidv4(),
                idProgramacion: prog.idProgramacion,
                idUsuario: prog.moto.usuario.idUsuario,
                idMoto: prog.moto.idMoto,
                idParadero: prog.paradero.idParadero,
                idTurno: prog.turno.idTurno,
                fecha: hoy,
                tipoMarcado: 'llegada',
                horaMarcado: new Date(),
                horaEsperada: prog.turno.horaInicio,
                latitudMarcado: 0,
                longitudMarcado: 0,
                distanciaMetros: 0,
                dentroRadio: false,
                estadoAsistencia: 'falta',
                minutosDiferencia: 0,
                observaciones: 'Falta automática - No marcó asistencia de llegada'
            });
            faltasMarcadas++;
        } else {
            // Verificar si marcó salida
            const marcadoSalida = await asistenciaRepo.findOne({
                where: {
                    idProgramacion: prog.idProgramacion,
                    tipoMarcado: 'salida'
                }
            });

            if (!marcadoSalida) {
                // Marcar falta automática de salida
                await asistenciaRepo.save({
                    idAsistencia: uuidv4(),
                    idProgramacion: prog.idProgramacion,
                    idUsuario: prog.moto.usuario.idUsuario,
                    idMoto: prog.moto.idMoto,
                    idParadero: prog.paradero.idParadero,
                    idTurno: prog.turno.idTurno,
                    fecha: hoy,
                    tipoMarcado: 'salida',
                    horaMarcado: new Date(),
                    horaEsperada: prog.turno.horaFin,
                    latitudMarcado: 0,
                    longitudMarcado: 0,
                    distanciaMetros: 0,
                    dentroRadio: false,
                    estadoAsistencia: 'falta',
                    minutosDiferencia: 0,
                    observaciones: 'Falta automática - No marcó asistencia de salida'
                });
                faltasMarcadas++;
            }
        }
    }

    console.log(`✅ [ASISTENCIA] ${faltasMarcadas} faltas marcadas automáticamente`);
    return faltasMarcadas;
}

/**
 * Obtiene el orden de llegada a Mormones para una fecha
 */
export async function obtenerOrdenLlegadaMormones(fecha: string): Promise<Asistencia[]> {
    return await asistenciaRepo
        .createQueryBuilder('a')
        .innerJoinAndSelect('a.usuario', 'usuario')
        .innerJoinAndSelect('a.moto', 'moto')
        .innerJoinAndSelect('a.paradero', 'paradero')
        .where('a.fecha = :fecha', { fecha })
        .andWhere('paradero.nombre = :nombre', { nombre: 'Mormones' })
        .andWhere('a.tipo_marcado = :tipo', { tipo: 'llegada' })
        .andWhere('a.estado_asistencia IN (:...estados)', {
            estados: ['asistio', 'tardanza']
        })
        .orderBy('a.orden_llegada', 'ASC')
        .getMany();
}

/**
 * Obtiene reporte de asistencias por paradero y fecha
 */
export async function obtenerReportePorParadero(
    idParadero: string,
    fecha: string
): Promise<Asistencia[]> {
    return await asistenciaRepo.find({
        where: {
            idParadero,
            fecha
        },
        relations: ['usuario', 'moto', 'turno'],
        order: {
            horaMarcado: 'ASC'
        }
    });
}

/**
 * Obtiene todas las faltas de una fecha
 */
export async function obtenerFaltasPorFecha(fecha: string): Promise<Asistencia[]> {
    return await asistenciaRepo.find({
        where: {
            fecha,
            estadoAsistencia: 'falta'
        },
        relations: ['usuario', 'moto', 'paradero', 'turno'],
        order: {
            horaMarcado: 'ASC'
        }
    });
}

/**
 * Obtiene todas las tardanzas de una fecha
 */
export async function obtenerTardanzasPorFecha(fecha: string): Promise<Asistencia[]> {
    return await asistenciaRepo.find({
        where: {
            fecha,
            estadoAsistencia: 'tardanza'
        },
        relations: ['usuario', 'moto', 'paradero', 'turno'],
        order: {
            minutosDiferencia: 'DESC'
        }
    });
}
