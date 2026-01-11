import { Request, Response } from 'express';
import { generarProgramacionComite24, eliminarProgramacionComite24 } from '../services/programacion-comite24.service';
import BaseResponse from '../shared/base.response';

/**
 * Genera programación de Comité 24 para una fecha específica
 * POST /api/v1/programacion-automatica/generar-comite24
 */
export const generarComite24 = async (req: Request, res: Response): Promise<void> => {
    try {
        // Obtener fecha del body o usar hoy
        const { fecha } = req.body;
        const fechaGeneracion = fecha || obtenerFechaHoy();

        // Validar formato de fecha
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaGeneracion)) {
            res.status(400).json(
                BaseResponse.error('Formato de fecha inválido. Use YYYY-MM-DD', 400)
            );
            return;
        }

        const programaciones = await generarProgramacionComite24(fechaGeneracion);

        // Calcular estadísticas
        const turnosUnicos = new Set(programaciones.map(p => p.turno.idTurno));
        const totalTurnos = turnosUnicos.size;
        const turnosCompletos = Array.from(turnosUnicos).filter(idTurno => {
            const asignaciones = programaciones.filter(p => p.turno.idTurno === idTurno);
            const cantidadRequerida = asignaciones[0]?.turno.cantidadMotos || 0;
            return asignaciones.length === cantidadRequerida;
        }).length;

        res.status(200).json(
            BaseResponse.success(
                {
                    fecha: fechaGeneracion,
                    totalAsignaciones: programaciones.length,
                    totalTurnos,
                    turnosCompletos,
                    turnosIncompletos: totalTurnos - turnosCompletos,
                    programacion: programaciones
                },
                `Comité 24 generado exitosamente para ${fechaGeneracion}`
            )
        );
    } catch (error: any) {
        console.error('Error al generar Comité 24:', error);
        res.status(400).json(
            BaseResponse.error(error.message || 'Error al generar Comité 24', 400)
        );
    }
};

/**
 * Elimina programación de Comité 24 para una fecha específica
 * DELETE /api/v1/programacion-automatica/comite24/:fecha
 */
export const eliminarComite24 = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fecha } = req.params;

        // Validar formato de fecha
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            res.status(400).json(
                BaseResponse.error('Formato de fecha inválido. Use YYYY-MM-DD', 400)
            );
            return;
        }

        await eliminarProgramacionComite24(fecha);

        res.status(200).json(
            BaseResponse.success(
                { fecha },
                `Programación de Comité 24 eliminada para ${fecha}`
            )
        );
    } catch (error: any) {
        console.error('Error al eliminar Comité 24:', error);
        res.status(400).json(
            BaseResponse.error(error.message || 'Error al eliminar Comité 24', 400)
        );
    }
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD (zona horaria de Perú)
 */
const obtenerFechaHoy = (): string => {
    const ahora = new Date();
    const peruOffset = -5 * 60; // UTC-5
    const peruTime = new Date(ahora.getTime() + peruOffset * 60 * 1000);
    return peruTime.toISOString().split('T')[0];
};
