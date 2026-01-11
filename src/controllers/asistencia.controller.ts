import { Request, Response } from 'express';
import * as asistenciaService from '../services/asistencia.service';
import BaseResponse from '../shared/base.response';

/**
 * Marcar asistencia (llegada o salida)
 */
export const marcarAsistencia = async (req: Request, res: Response) => {
    try {
        const idUsuario = req.user?.idUsuario;

        if (!idUsuario) {
            return res.status(401).json(
                BaseResponse.error('Usuario no autenticado', 401)
            );
        }

        const { tipo_marcado, latitud, longitud, dispositivo } = req.body;

        // Validaciones
        if (!tipo_marcado || !['llegada', 'salida'].includes(tipo_marcado)) {
            return res.status(400).json(
                BaseResponse.error('tipo_marcado debe ser "llegada" o "salida"', 400)
            );
        }

        if (typeof latitud !== 'number' || typeof longitud !== 'number') {
            return res.status(400).json(
                BaseResponse.error('latitud y longitud son requeridos', 400)
            );
        }

        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

        const asistencia = await asistenciaService.marcarAsistencia(
            idUsuario,
            { tipo_marcado, latitud, longitud, dispositivo },
            ipAddress
        );

        return res.status(201).json(
            BaseResponse.success(asistencia, 'Asistencia marcada exitosamente')
        );
    } catch (error: any) {
        console.error('Error al marcar asistencia:', error);
        return res.status(400).json(
            BaseResponse.error(error.message || 'Error al marcar asistencia', 400)
        );
    }
};

/**
 * Obtener mi programación de hoy
 */
export const obtenerMiProgramacionHoy = async (req: Request, res: Response) => {
    try {
        const idUsuario = req.user?.idUsuario;

        if (!idUsuario) {
            return res.status(401).json(
                BaseResponse.error('Usuario no autenticado', 401)
            );
        }

        const programaciones = await asistenciaService.obtenerMiProgramacionHoy(idUsuario);

        if (!programaciones || programaciones.length === 0) {
            return res.status(404).json(
                BaseResponse.error('No tienes programación para hoy', 404)
            );
        }

        return res.status(200).json(
            BaseResponse.success(programaciones, 'Programación obtenida exitosamente')
        );
    } catch (error: any) {
        console.error('Error al obtener programación:', error);
        return res.status(500).json(
            BaseResponse.error('Error al obtener programación', 500)
        );
    }
};

/**
 * Obtener mi historial de asistencias
 */
export const obtenerMiHistorial = async (req: Request, res: Response) => {
    try {
        const idUsuario = req.user?.idUsuario;

        if (!idUsuario) {
            return res.status(401).json(
                BaseResponse.error('Usuario no autenticado', 401)
            );
        }

        const { desde, hasta } = req.query;

        const historial = await asistenciaService.obtenerHistorialAsistencias(
            idUsuario,
            desde as string,
            hasta as string
        );

        return res.status(200).json(
            BaseResponse.success(historial, 'Historial obtenido exitosamente')
        );
    } catch (error: any) {
        console.error('Error al obtener historial:', error);
        return res.status(500).json(
            BaseResponse.error('Error al obtener historial', 500)
        );
    }
};

/**
 * Obtener orden de llegada a Mormones (Admin)
 */
export const obtenerOrdenLlegada = async (req: Request, res: Response) => {
    try {
        const { fecha } = req.params;

        const orden = await asistenciaService.obtenerOrdenLlegadaMormones(fecha);

        return res.status(200).json(
            BaseResponse.success(orden, 'Orden de llegada obtenido exitosamente')
        );
    } catch (error: any) {
        console.error('Error al obtener orden de llegada:', error);
        return res.status(500).json(
            BaseResponse.error('Error al obtener orden de llegada', 500)
        );
    }
};

/**
 * Obtener reporte de asistencias por paradero (Admin)
 */
export const obtenerReportePorParadero = async (req: Request, res: Response) => {
    try {
        const { idParadero, fecha } = req.params;

        const reporte = await asistenciaService.obtenerReportePorParadero(
            idParadero,
            fecha
        );

        return res.status(200).json(
            BaseResponse.success(reporte, 'Reporte obtenido exitosamente')
        );
    } catch (error: any) {
        console.error('Error al obtener reporte:', error);
        return res.status(500).json(
            BaseResponse.error('Error al obtener reporte', 500)
        );
    }
};

/**
 * Obtener faltas por fecha (Admin)
 */
export const obtenerFaltas = async (req: Request, res: Response) => {
    try {
        const { fecha } = req.params;

        const faltas = await asistenciaService.obtenerFaltasPorFecha(fecha);

        return res.status(200).json(
            BaseResponse.success(faltas, 'Faltas obtenidas exitosamente')
        );
    } catch (error: any) {
        console.error('Error al obtener faltas:', error);
        return res.status(500).json(
            BaseResponse.error('Error al obtener faltas', 500)
        );
    }
};

/**
 * Obtener tardanzas por fecha (Admin)
 */
export const obtenerTardanzas = async (req: Request, res: Response) => {
    try {
        const { fecha } = req.params;

        const tardanzas = await asistenciaService.obtenerTardanzasPorFecha(fecha);

        return res.status(200).json(
            BaseResponse.success(tardanzas, 'Tardanzas obtenidas exitosamente')
        );
    } catch (error: any) {
        console.error('Error al obtener tardanzas:', error);
        return res.status(500).json(
            BaseResponse.error('Error al obtener tardanzas', 500)
        );
    }
};
