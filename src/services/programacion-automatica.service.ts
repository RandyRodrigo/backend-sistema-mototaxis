import { AppDataSource } from "../config/appdatasource";
import { Programacion } from "../entities/programacion";
import { Moto } from "../entities/moto";
import { Paradero } from "../entities/paradero";
import { Turno } from "../entities/turno";
import { ConfiguracionTurno } from "../entities/configuracion-turno";
import { EstadoAlternancia } from "../entities/estado-alternancia";
import { SolicitudPermiso } from "../entities/solicitud-permiso";
import { OrdenLlegadaComite24 } from "../entities/orden-llegada-comite24";
import { generarUUID } from "../shared/util";
import { EstadoAuditoriaEnum } from "../enums/estado-auditoria.enums";
import { EstadoMotoEnum } from "../enums/estado-moto.enums";
import { Between } from "typeorm";

const programacionRepo = AppDataSource.getRepository(Programacion);
const motoRepo = AppDataSource.getRepository(Moto);
const paraderoRepo = AppDataSource.getRepository(Paradero);
const turnoRepo = AppDataSource.getRepository(Turno);
const configuracionRepo = AppDataSource.getRepository(ConfiguracionTurno);
const estadoAlternanciaRepo = AppDataSource.getRepository(EstadoAlternancia);
const solicitudPermisoRepo = AppDataSource.getRepository(SolicitudPermiso);
const ordenLlegadaRepo = AppDataSource.getRepository(OrdenLlegadaComite24);

/**
 * Genera la programación automática para una fecha específica
 */
export const generarProgramacionDiaria = async (fecha: string): Promise<Programacion[]> => {
    // 1. Verificar si ya existe programación para esta fecha
    const programacionExistente = await programacionRepo.count({ where: { fecha } });
    if (programacionExistente > 0) {
        throw new Error(`Ya existe programación para la fecha ${fecha}`);
    }

    // 2. Determinar tipo de día (par/impar) y posición de Curva Noche
    const tipoDia = await determinarTipoDia(fecha);
    const posicionCurvaNoche = await determinarPosicionCurvaNoche(fecha);

    // 3. Guardar el estado de alternancia para esta fecha
    await guardarEstadoAlternancia(fecha, tipoDia, posicionCurvaNoche);

    // 4. Obtener todas las motos activas
    const todasLasMotos = await obtenerMotosActivas();

    // 5. Calcular el número máximo de moto disponible (dinámico)
    const maxNumeroMoto = todasLasMotos.length > 0
        ? Math.max(...todasLasMotos.map(m => m.numeroMoto))
        : 159; // Fallback a 159 si no hay motos

    // 6. Obtener permisos aprobados para esta fecha
    const permisosDelDia = await obtenerPermisosAprobados(fecha);
    const numerosConPermiso = new Set(permisosDelDia.map(p => p.moto.numeroMoto));

    // 6. Obtener configuraciones de turnos ordenadas por prioridad
    const configuraciones = await obtenerConfiguracionesOrdenadas();

    const programaciones: Programacion[] = [];

    // 7. Obtener el último número asignado del día anterior para continuar la secuencia
    let ultimoNumeroAsignado = await obtenerUltimoNumeroAsignado(fecha);

    // 7. PASO 1: Asignar Mormones (sin alternancia)
    const configMormones = configuraciones.find(c => c.turno.nombre === 'Turno Único Mormones');
    if (configMormones && turnoAplicaParaDia(configMormones.turno, fecha)) {
        const { asignaciones, ultimoNumero } = await asignarSecuencialSinAlternancia(
            configMormones.turno,
            ultimoNumeroAsignado,
            todasLasMotos,
            numerosConPermiso,
            fecha,
            maxNumeroMoto
        );
        programaciones.push(...asignaciones);
        ultimoNumeroAsignado = ultimoNumero;
    }

    // 8. PASO 2: Asignar Lomas (con alternancia, continúa desde Mormones)
    const configLomas = configuraciones.find(c => c.turno.nombre === 'Lomas Turno Mañana');
    let programacionLomas: Programacion[] = [];
    if (configLomas && turnoAplicaParaDia(configLomas.turno, fecha)) {
        const { asignaciones, ultimoNumero } = await asignarSecuencialConAlternancia(
            configLomas.turno,
            ultimoNumeroAsignado,
            tipoDia,
            todasLasMotos,
            numerosConPermiso,
            fecha,
            maxNumeroMoto
        );
        programacionLomas = asignaciones;
        programaciones.push(...asignaciones);
        ultimoNumeroAsignado = ultimoNumero;
    }

    // 9. PASO 3: Asignar Curva Mañana (con alternancia, continúa desde Lomas)
    const configCurvaMañana = configuraciones.find(c => c.turno.nombre === 'Curva Turno Mañana');
    if (configCurvaMañana && turnoAplicaParaDia(configCurvaMañana.turno, fecha)) {
        const { asignaciones, ultimoNumero } = await asignarSecuencialConAlternancia(
            configCurvaMañana.turno,
            ultimoNumeroAsignado,
            tipoDia,
            todasLasMotos,
            numerosConPermiso,
            fecha,
            maxNumeroMoto
        );
        programaciones.push(...asignaciones);
        ultimoNumeroAsignado = ultimoNumero;
    }

    // 10. PASO 4: Asignar Curva Noche (ESPECIAL: primeros/últimos 7 de Mormones)
    const configCurvaNoche = configuraciones.find(c => c.turno.nombre === 'Curva Turno Noche');
    const programacionMormones = programaciones.filter(p => p.turno.nombre === 'Turno Único Mormones');
    if (configCurvaNoche && programacionMormones.length > 0 && turnoAplicaParaDia(configCurvaNoche.turno, fecha)) {
        const asignaciones = await asignarCurvaNoche(
            configCurvaNoche.turno,
            fecha,
            tipoDia,
            programacionMormones,
            posicionCurvaNoche
        );
        programaciones.push(...asignaciones);
    }

    // 11. PASO 5: Asignar Comité 42 (ESPECIAL: reutiliza números de Lomas)
    const turnosComite42 = configuraciones
        .filter(c => c.turno.nombre.includes('Turno 42'))
        .filter(c => turnoAplicaParaDia(c.turno, fecha))
        .map(c => c.turno)
        .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

    if (turnosComite42.length > 0 && programacionLomas.length > 0) {
        const asignaciones = await asignarComite42(
            turnosComite42,
            fecha,
            tipoDia,
            programacionLomas,
            maxNumeroMoto
        );
        programaciones.push(...asignaciones);
    }

    // 12. PASO 6: Asignar Comité 24 (por orden de llegada)
    const turnosComite24 = configuraciones
        .filter(c => c.tipoAsignacion === 'orden_llegada')
        .filter(c => turnoAplicaParaDia(c.turno, fecha))
        .map(c => c.turno);

    if (turnosComite24.length > 0) {
        const asignacionesComite24 = await asignarPorOrdenLlegada(fecha, turnosComite24);
        programaciones.push(...asignacionesComite24);
    }

    // 13. Guardar todas las programaciones
    const programacionesGuardadas = await programacionRepo.save(programaciones);

    return programacionesGuardadas;
};

/**
 * Determina si el día es par o impar basado en el día anterior
 */
const determinarTipoDia = async (fecha: string): Promise<'par' | 'impar'> => {
    const fechaAnterior = restarUnDia(fecha);
    const estadoAnterior = await estadoAlternanciaRepo.findOne({
        where: { fecha: fechaAnterior }
    });

    if (!estadoAnterior) {
        return 'par'; // Primer día: empezar con 'par'
    }

    // Alternar: si ayer fue 'par', hoy es 'impar' y viceversa
    return estadoAnterior.tipoDia === 'par' ? 'impar' : 'par';
};

/**
 * Determina si Curva Noche debe tomar primeros o últimos 7 de Mormones
 */
const determinarPosicionCurvaNoche = async (fecha: string): Promise<'primeros' | 'ultimos'> => {
    const fechaAnterior = restarUnDia(fecha);
    const estadoAnterior = await estadoAlternanciaRepo.findOne({
        where: { fecha: fechaAnterior }
    });

    if (!estadoAnterior || !estadoAnterior.posicionCurvaNoche) {
        return 'primeros'; // Primer día: empezar con 'primeros'
    }

    // Alternar: si ayer fue 'ultimos', hoy es 'primeros' y viceversa
    return estadoAnterior.posicionCurvaNoche === 'ultimos' ? 'primeros' : 'ultimos';
};

/**
 * Verifica si un turno debe programarse en el día de la semana especificado
 * Basado en el campo diasSemana del turno
 */
const turnoAplicaParaDia = (turno: Turno, fecha: string): boolean => {
    // Si no hay configuración de días, programar siempre
    if (!turno.diasSemana) {
        return true;
    }

    // Obtener día de la semana en español (0=domingo, 1=lunes, ..., 6=sábado)
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const fechaObj = new Date(fecha + 'T00:00:00');
    const diaSemana = diasSemana[fechaObj.getDay()];

    // Verificar si el día está en la lista de días del turno
    const diasTurno = turno.diasSemana.toLowerCase().split(',').map(d => d.trim());
    return diasTurno.includes(diaSemana);
};

/**
 * Guarda el estado de alternancia para una fecha
 */
const guardarEstadoAlternancia = async (
    fecha: string,
    tipoDia: 'par' | 'impar',
    posicionCurvaNoche: 'primeros' | 'ultimos'
): Promise<void> => {
    const estado = estadoAlternanciaRepo.create({
        fecha,
        tipoDia,
        posicionCurvaNoche,
        estadoAuditoria: EstadoAuditoriaEnum.ACTIVO.toString()
    });
    await estadoAlternanciaRepo.save(estado);
};

/**
 * Obtiene todas las motos activas
 */
const obtenerMotosActivas = async (): Promise<Moto[]> => {
    return await motoRepo.find({
        where: {
            estado: EstadoMotoEnum.ACTIVO,
            estadoAuditoria: EstadoAuditoriaEnum.ACTIVO
        },
        order: {
            numeroMoto: 'ASC'
        }
    });
};

/**
 * Obtiene los permisos aprobados para una fecha
 */
const obtenerPermisosAprobados = async (fecha: string): Promise<SolicitudPermiso[]> => {
    return await solicitudPermisoRepo.find({
        where: {
            estado: 'aprobado',
            fechaInicio: Between(fecha, fecha),
            estadoAuditoria: EstadoAuditoriaEnum.ACTIVO.toString()
        },
        relations: ['moto']
    });
};

/**
 * Obtiene las configuraciones de turnos ordenadas por prioridad
 */
const obtenerConfiguracionesOrdenadas = async (): Promise<ConfiguracionTurno[]> => {
    return await configuracionRepo.find({
        where: {
            estadoAuditoria: EstadoAuditoriaEnum.ACTIVO.toString()
        },
        relations: ['turno'],
        order: {
            prioridadAsignacion: 'ASC'
        }
    });
};

/**
 * Obtiene el último número de moto asignado a Mormones del día anterior
 * para continuar la secuencia día a día
 */
const obtenerUltimoNumeroAsignado = async (fechaActual: string): Promise<number> => {
    const fechaAnterior = restarUnDia(fechaActual);

    // Buscar la programación de Mormones del día anterior
    const programacionAnterior = await programacionRepo.find({
        where: { fecha: fechaAnterior },
        relations: ['moto', 'turno'],
        order: {
            ordenAsignacion: 'DESC'
        }
    });

    if (programacionAnterior.length === 0) {
        // Si no hay programación anterior, empezar desde 0
        return 0;
    }

    // Buscar específicamente el último número asignado a Mormones
    const asignacionesMormones = programacionAnterior.filter(
        p => p.turno.nombre === 'Turno Único Mormones'
    );

    if (asignacionesMormones.length === 0) {
        // Si no hay asignaciones de Mormones, empezar desde 0
        return 0;
    }

    // Obtener el último número asignado a Mormones (el primero en orden DESC)
    const ultimoNumero = asignacionesMormones[0].moto.numeroMoto;

    return ultimoNumero;
};

/**
 * Asigna motos secuencialmente SIN alternancia (para Mormones)
 */
const asignarSecuencialSinAlternancia = async (
    turno: Turno,
    numeroInicial: number,
    todasLasMotos: Moto[],
    numerosConPermiso: Set<number>,
    fecha: string,
    maxNumeroMoto: number
): Promise<{ asignaciones: Programacion[], ultimoNumero: number }> => {
    const cantidadRequerida = turno.cantidadMotos;
    const paradero = await paraderoRepo.findOne({ where: { idParadero: turno.idParadero } });

    if (!paradero) {
        throw new Error(`Paradero no encontrado para turno ${turno.nombre}`);
    }

    const asignaciones: Programacion[] = [];
    let numeroActual = numeroInicial + 1;
    let intentos = 0;
    const MAX_INTENTOS = 200; // Evitar bucle infinito

    while (asignaciones.length < cantidadRequerida && intentos < MAX_INTENTOS) {
        // Wrap-around: si llegamos al límite máximo, reiniciar desde 1
        if (numeroActual > maxNumeroMoto) {
            numeroActual = 1;
        }

        const noTienePermiso = !numerosConPermiso.has(numeroActual);
        const motoExiste = todasLasMotos.find(m => m.numeroMoto === numeroActual);

        if (noTienePermiso && motoExiste) {
            const programacion = programacionRepo.create({
                idProgramacion: generarUUID(),
                moto: motoExiste,
                paradero: paradero,
                turno: turno,
                fecha: fecha,
                ordenAsignacion: asignaciones.length + 1,
                esCompensacion: false,
                tipoDia: null, // Mormones no usa alternancia
                generadoAutomaticamente: true,
                estadoAuditoria: EstadoAuditoriaEnum.ACTIVO
            });

            asignaciones.push(programacion);
        }

        numeroActual++;
        intentos++;
    }

    // El último número asignado es el anterior al actual (ajustando por wrap-around)
    let ultimoNumero = numeroActual - 1;
    if (ultimoNumero < 1) {
        ultimoNumero = maxNumeroMoto;
    }

    return {
        asignaciones,
        ultimoNumero
    };
};

/**
 * Asigna motos secuencialmente CON alternancia par/impar
 */
const asignarSecuencialConAlternancia = async (
    turno: Turno,
    numeroInicial: number,
    tipoDia: 'par' | 'impar',
    todasLasMotos: Moto[],
    numerosConPermiso: Set<number>,
    fecha: string,
    maxNumeroMoto: number
): Promise<{ asignaciones: Programacion[], ultimoNumero: number }> => {
    const cantidadRequerida = turno.cantidadMotos;
    const paradero = await paraderoRepo.findOne({ where: { idParadero: turno.idParadero } });

    if (!paradero) {
        throw new Error(`Paradero no encontrado para turno ${turno.nombre}`);
    }

    const asignaciones: Programacion[] = [];
    let numeroActual = numeroInicial + 1;
    let intentos = 0;
    const MAX_INTENTOS = 200; // Evitar bucle infinito

    while (asignaciones.length < cantidadRequerida && intentos < MAX_INTENTOS) {
        // Wrap-around: si llegamos al límite máximo, reiniciar desde 1
        if (numeroActual > maxNumeroMoto) {
            numeroActual = 1;
        }

        // Verificar alternancia
        const cumpleAlternancia = (tipoDia === 'par' && numeroActual % 2 === 0) ||
            (tipoDia === 'impar' && numeroActual % 2 !== 0);

        const noTienePermiso = !numerosConPermiso.has(numeroActual);
        const motoExiste = todasLasMotos.find(m => m.numeroMoto === numeroActual);

        if (cumpleAlternancia && noTienePermiso && motoExiste) {
            const programacion = programacionRepo.create({
                idProgramacion: generarUUID(),
                moto: motoExiste,
                paradero: paradero,
                turno: turno,
                fecha: fecha,
                ordenAsignacion: asignaciones.length + 1,
                esCompensacion: false,
                tipoDia: tipoDia,
                generadoAutomaticamente: true,
                estadoAuditoria: EstadoAuditoriaEnum.ACTIVO
            });

            asignaciones.push(programacion);
        }

        numeroActual++;
        intentos++;
    }

    // El último número asignado es el anterior al actual (ajustando por wrap-around)
    let ultimoNumero = numeroActual - 1;
    if (ultimoNumero < 1) {
        ultimoNumero = maxNumeroMoto;
    }

    return {
        asignaciones,
        ultimoNumero
    };
};

/**
 * Asigna Curva Noche tomando primeros o últimos 7 de Mormones
 */
const asignarCurvaNoche = async (
    turno: Turno,
    fecha: string,
    tipoDia: 'par' | 'impar',
    programacionMormones: Programacion[],
    posicion: 'primeros' | 'ultimos'
): Promise<Programacion[]> => {
    const paradero = await paraderoRepo.findOne({ where: { idParadero: turno.idParadero } });

    if (!paradero) {
        throw new Error(`Paradero no encontrado para turno ${turno.nombre}`);
    }

    // 1. Obtener números de Mormones en ORDEN DE ASIGNACIÓN (no ordenar numéricamente)
    const numerosMormones = programacionMormones
        .sort((a, b) => a.ordenAsignacion - b.ordenAsignacion)  // Mantener orden de asignación
        .map(p => p.moto.numeroMoto);

    // 2. Filtrar por tipo de día (mantiene el orden de asignación)
    const numerosFiltrados = numerosMormones.filter(num =>
        tipoDia === 'par' ? num % 2 === 0 : num % 2 !== 0
    );

    // 3. Tomar PRIMEROS 7 o ÚLTIMOS 7 según la posición (del orden de asignación)
    const numerosSeleccionados = posicion === 'primeros'
        ? numerosFiltrados.slice(0, 7)  // Primeros 7 del orden de asignación
        : numerosFiltrados.slice(-7);    // Últimos 7 del orden de asignación

    // 4. Crear asignaciones
    const asignaciones: Programacion[] = [];
    for (let i = 0; i < numerosSeleccionados.length; i++) {
        const numeroMoto = numerosSeleccionados[i];
        const moto = await motoRepo.findOne({ where: { numeroMoto } });

        if (moto) {
            const programacion = programacionRepo.create({
                idProgramacion: generarUUID(),
                moto: moto,
                paradero: paradero,
                turno: turno,
                fecha: fecha,
                ordenAsignacion: i + 1,
                esCompensacion: false,
                tipoDia: tipoDia,
                generadoAutomaticamente: true,
                estadoAuditoria: EstadoAuditoriaEnum.ACTIVO
            });
            asignaciones.push(programacion);
        }
    }

    return asignaciones;
};

/**
 * Asigna Comité 42 con lógica HÍBRIDA
 * 1. REUTILIZA números de Lomas mientras haya disponibles
 * 2. CONTINÚA la secuencia cuando se agoten los números de Lomas
 */
const asignarComite42 = async (
    turnosComite42: Turno[],
    fecha: string,
    tipoDia: 'par' | 'impar',
    programacionLomas: Programacion[],
    maxNumero: number
): Promise<Programacion[]> => {
    // 1. Obtener números de Lomas en ORDEN DE ASIGNACIÓN
    const numerosLomas = programacionLomas
        .sort((a, b) => a.ordenAsignacion - b.ordenAsignacion)
        .map(p => p.moto.numeroMoto);

    // 2. Calcular cuántos números necesitamos en total
    const totalNumerosNecesarios = turnosComite42.reduce((sum, turno) => sum + turno.cantidadMotos, 0);

    // 3. LÓGICA HÍBRIDA: Reutilizar Lomas primero, luego continuar secuencia
    const numerosParaComite42: number[] = [];

    for (let i = 0; i < totalNumerosNecesarios; i++) {
        if (i < numerosLomas.length) {
            // Mientras haya números de Lomas, reutilizarlos
            numerosParaComite42.push(numerosLomas[i]);
        } else {
            // Cuando se agoten, continuar la secuencia desde el último número de Lomas
            const ultimoNumeroLomas = numerosLomas[numerosLomas.length - 1];
            const numerosGenerados = i - numerosLomas.length + 1;
            let numeroActual = ultimoNumeroLomas + (numerosGenerados * 2);

            // Wrap-around si excede el máximo
            if (numeroActual > maxNumero) {
                // Calcular cuántos números se pasaron del límite
                const exceso = Math.floor((numeroActual - maxNumero - 1) / 2);
                numeroActual = (tipoDia === 'par' ? 2 : 1) + (exceso * 2);
            }

            numerosParaComite42.push(numeroActual);
        }
    }

    // 4. Asignar números a cada turno
    const programaciones: Programacion[] = [];
    let indice = 0;

    for (const turno of turnosComite42) {
        const cantidad = turno.cantidadMotos;
        const numerosParaTurno = numerosParaComite42.slice(indice, indice + cantidad);

        const paradero = await paraderoRepo.findOne({ where: { idParadero: turno.idParadero } });

        if (!paradero) {
            console.warn(`Paradero no encontrado para turno ${turno.nombre}`);
            continue;
        }

        for (let i = 0; i < numerosParaTurno.length; i++) {
            const numeroMoto = numerosParaTurno[i];
            const moto = await motoRepo.findOne({ where: { numeroMoto } });

            if (moto) {
                const programacion = programacionRepo.create({
                    idProgramacion: generarUUID(),
                    moto: moto,
                    paradero: paradero,
                    turno: turno,
                    fecha: fecha,
                    ordenAsignacion: i + 1,
                    esCompensacion: false,
                    tipoDia: tipoDia,
                    generadoAutomaticamente: true,
                    estadoAuditoria: EstadoAuditoriaEnum.ACTIVO
                });
                programaciones.push(programacion);
            }
        }

        indice += cantidad;
    }

    return programaciones;
};

/**
 * Asigna Comité 24 por orden de llegada (marcado de asistencia en Mormones)
 */
const asignarPorOrdenLlegada = async (
    fecha: string,
    turnosComite24: Turno[]
): Promise<Programacion[]> => {
    const ordenesLlegada = await ordenLlegadaRepo.find({
        where: {
            fecha,
            estadoAuditoria: EstadoAuditoriaEnum.ACTIVO.toString()
        },
        order: {
            orden: 'ASC'
        }
    });

    if (ordenesLlegada.length === 0) {
        console.warn(`No hay registros de orden de llegada para la fecha ${fecha}`);
        return [];
    }

    const programaciones: Programacion[] = [];
    let indiceOrden = 0;

    for (const turno of turnosComite24) {
        const cantidadRequerida = turno.cantidadMotos;
        const paradero = await paraderoRepo.findOne({ where: { idParadero: turno.idParadero } });

        if (!paradero) {
            console.warn(`Paradero no encontrado para turno ${turno.nombre}`);
            continue;
        }

        for (let i = 0; i < cantidadRequerida && indiceOrden < ordenesLlegada.length; i++) {
            const ordenLlegada = ordenesLlegada[indiceOrden];
            const moto = await motoRepo.findOne({
                where: {
                    numeroMoto: ordenLlegada.numeroMoto,
                    estadoAuditoria: EstadoAuditoriaEnum.ACTIVO
                }
            });

            if (moto) {
                const programacion = programacionRepo.create({
                    idProgramacion: generarUUID(),
                    moto: moto,
                    paradero: paradero,
                    turno: turno,
                    fecha: fecha,
                    ordenAsignacion: i + 1,
                    esCompensacion: false,
                    tipoDia: null,
                    generadoAutomaticamente: true,
                    estadoAuditoria: EstadoAuditoriaEnum.ACTIVO
                });

                programaciones.push(programacion);
                ordenLlegada.turnoAsignado = turno;
                await ordenLlegadaRepo.save(ordenLlegada);
            }

            indiceOrden++;
        }
    }

    return programaciones;
};

/**
 * Elimina la programación de una fecha específica
 */
export const eliminarProgramacionPorFecha = async (fecha: string): Promise<void> => {
    await programacionRepo.delete({ fecha });
    await estadoAlternanciaRepo.delete({ fecha });
    console.log(`Programación eliminada para la fecha ${fecha}`);
};

/**
 * Obtiene la programación de una fecha específica
 */
export const obtenerProgramacionPorFecha = async (fecha: string): Promise<Programacion[]> => {
    return await programacionRepo.find({
        where: { fecha },
        relations: ['moto', 'paradero', 'turno'],
        order: {
            ordenAsignacion: 'ASC'
        }
    });
};

/**
 * Registra el orden de llegada para Comité 24
 */
export const registrarOrdenLlegada = async (
    fecha: string,
    numeroMoto: number,
    horaMarcado: string
): Promise<OrdenLlegadaComite24> => {
    const ultimoOrden = await ordenLlegadaRepo.findOne({
        where: { fecha },
        order: { orden: 'DESC' }
    });

    const nuevoOrden = (ultimoOrden?.orden || 0) + 1;

    const ordenLlegada = ordenLlegadaRepo.create({
        fecha,
        numeroMoto,
        horaMarcado,
        orden: nuevoOrden,
        estadoAuditoria: EstadoAuditoriaEnum.ACTIVO.toString()
    });

    return await ordenLlegadaRepo.save(ordenLlegada);
};

/**
 * Obtiene la programación en formato visual agrupado por paradero y turno
 * Optimizado para visualización en frontend
 */
export const obtenerProgramacionVisual = async (fecha: string) => {
    const programaciones = await programacionRepo.find({
        where: { fecha },
        relations: ['moto', 'paradero', 'turno'],
        order: {
            ordenAsignacion: 'ASC'
        }
    });

    if (programaciones.length === 0) {
        return {
            fecha,
            totalAsignaciones: 0,
            paraderos: []
        };
    }

    // Interfaces para tipado
    interface TurnoData {
        nombre: string;
        horaInicio: string;
        horaFin: string;
        tipoDia: string | null;
        numeros: number[];
    }

    interface ParaderoData {
        nombre: string;
        direccion: string;
        turnos: Map<string, TurnoData>;
    }

    // Agrupar por paradero
    const paraderoMap = new Map<string, ParaderoData>();

    for (const prog of programaciones) {
        const paraderoNombre = prog.paradero.nombre;

        if (!paraderoMap.has(paraderoNombre)) {
            paraderoMap.set(paraderoNombre, {
                nombre: paraderoNombre,
                direccion: prog.paradero.direccion,
                turnos: new Map<string, any>()
            });
        }

        const paraderoData = paraderoMap.get(paraderoNombre)!;
        const turnoKey = `${prog.turno.nombre}|${prog.turno.horaInicio}|${prog.turno.horaFin}`;

        if (!paraderoData.turnos.has(turnoKey)) {
            paraderoData.turnos.set(turnoKey, {
                nombre: prog.turno.nombre,
                horaInicio: prog.turno.horaInicio,
                horaFin: prog.turno.horaFin,
                tipoDia: prog.tipoDia,
                numeros: []
            });
        }

        paraderoData.turnos.get(turnoKey)!.numeros.push(prog.moto.numeroMoto);
    }

    // Convertir Maps a Arrays
    const paraderos = Array.from(paraderoMap.values()).map(paradero => ({
        nombre: paradero.nombre,
        direccion: paradero.direccion,
        turnos: Array.from(paradero.turnos.values()).map((turno: TurnoData) => ({
            nombre: turno.nombre,
            horario: `${turno.horaInicio.substring(0, 5)} - ${turno.horaFin.substring(0, 5)}`,
            horaInicio: turno.horaInicio,
            horaFin: turno.horaFin,
            tipoDia: turno.tipoDia,
            numeros: turno.numeros,
            totalMotos: turno.numeros.length
        }))
    }));

    // Ordenar paraderos según el orden deseado
    const ordenParaderos = ['Mormones', 'Lomas', 'Curva', 'Comité 42', 'Comité 24'];
    paraderos.sort((a, b) => {
        const indexA = ordenParaderos.indexOf(a.nombre);
        const indexB = ordenParaderos.indexOf(b.nombre);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    return {
        fecha,
        totalAsignaciones: programaciones.length,
        paraderos
    };
};

/**
 * Utilidad: Resta un día a una fecha
 */
const restarUnDia = (fecha: string): string => {
    const date = new Date(fecha);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
};

