import { Request, Response } from "express";
import BaseResponse from "../shared/base.response";
import * as programacionAutomaticaService from "../services/programacion-automatica.service";

/**
 * Genera automáticamente la programación para el día siguiente
 * Se ejecuta automáticamente a las 6pm o manualmente por un admin
 * Acepta una fecha opcional en el body para generar programación de días específicos
 */
export const generarProgramacionDiaSiguiente = async (req: Request, res: Response) => {
    try {
        // Si se proporciona una fecha en el body, usarla; sino, calcular mañana
        let fechaObjetivo: string;

        if (req.body && req.body.fecha) {
            fechaObjetivo = req.body.fecha;
        } else {
            // Calcular fecha del día siguiente
            const mañana = new Date();
            mañana.setDate(mañana.getDate() + 1);
            fechaObjetivo = mañana.toISOString().split('T')[0];
        }

        const programacion = await programacionAutomaticaService.generarProgramacionDiaria(fechaObjetivo);

        res.status(201).json(BaseResponse.success(
            {
                fecha: fechaObjetivo,
                totalAsignaciones: programacion.length,
                programacion
            },
            `Programación generada exitosamente para ${fechaObjetivo}`
        ));
    } catch (error) {
        console.error('Error al generar programación:', error);
        res.status(500).json(BaseResponse.error(error.message));
    }
};

/**
 * Obtiene la programación de una fecha específica
 * Los conductores consultan aquí su asignación
 */
export const obtenerProgramacionPorFecha = async (req: Request, res: Response) => {
    try {
        const { fecha } = req.params;
        const programacion = await programacionAutomaticaService.obtenerProgramacionPorFecha(fecha);

        if (programacion.length === 0) {
            res.status(404).json(BaseResponse.error('No hay programación para esta fecha', 404));
            return;
        }

        res.status(200).json(BaseResponse.success(programacion, 'Programación obtenida correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
};

/**
 * Obtiene la programación del día de mañana
 * Endpoint principal para conductores
 */
export const obtenerProgramacionMañana = async (req: Request, res: Response) => {
    try {
        const mañana = new Date();
        mañana.setDate(mañana.getDate() + 1);
        const fechaMañana = mañana.toISOString().split('T')[0];

        const programacion = await programacionAutomaticaService.obtenerProgramacionPorFecha(fechaMañana);

        if (programacion.length === 0) {
            res.status(404).json(BaseResponse.error('Aún no se ha generado la programación para mañana', 404));
            return;
        }

        res.status(200).json(BaseResponse.success(
            {
                fecha: fechaMañana,
                programacion
            },
            'Programación de mañana obtenida correctamente'
        ));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
};

/**
 * Registra el orden de llegada de una moto en Mormones
 * Para asignación de Comité 24
 */
export const registrarOrdenLlegada = async (req: Request, res: Response) => {
    try {
        const { numeroMoto, horaMarcado } = req.body;

        // Usar la fecha de hoy
        const hoy = new Date().toISOString().split('T')[0];

        const ordenLlegada = await programacionAutomaticaService.registrarOrdenLlegada(
            hoy,
            numeroMoto,
            horaMarcado
        );

        res.status(201).json(BaseResponse.success(
            ordenLlegada,
            'Orden de llegada registrado correctamente'
        ));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
};

/**
 * Elimina la programación de una fecha (solo admin)
 * Por si necesita regenerar
 */
export const eliminarProgramacionPorFecha = async (req: Request, res: Response) => {
    try {
        const { fecha } = req.params;
        await programacionAutomaticaService.eliminarProgramacionPorFecha(fecha);

        res.status(200).json(BaseResponse.success(null, `Programación eliminada para ${fecha}`));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
};

/**
 * Obtiene la programación en formato visual agrupado por paradero y turno
 * NUEVO: Formato optimizado para visualización en frontend
 */
export const obtenerProgramacionVisualPorFecha = async (req: Request, res: Response) => {
    try {
        const { fecha } = req.params;

        if (!fecha) {
            res.status(400).json(BaseResponse.error('La fecha es requerida', 400));
            return;
        }

        const programacionVisual = await programacionAutomaticaService.obtenerProgramacionVisual(fecha);

        if (programacionVisual.paraderos.length === 0) {
            res.status(404).json(BaseResponse.error(`No se encontró programación para la fecha ${fecha}`, 404));
            return;
        }

        res.status(200).json(BaseResponse.success(
            programacionVisual,
            'Programación visual obtenida exitosamente'
        ));
    } catch (error) {
        console.error('Error al obtener programación visual:', error);
        res.status(500).json(BaseResponse.error(error.message));
    }
};

/**
 * Obtiene la programación personal del usuario autenticado filtrada por su numeroMoto
 * NUEVO: Solo retorna paraderos y turnos donde está asignado el usuario
 */
export const obtenerMiProgramacionPorFecha = async (req: Request, res: Response) => {
    try {
        const { fecha } = req.params;
        const userId = req.user?.idUsuario;

        if (!fecha) {
            res.status(400).json(BaseResponse.error('La fecha es requerida', 400));
            return;
        }

        if (!userId) {
            res.status(401).json(BaseResponse.error('Usuario no autenticado', 401));
            return;
        }

        // Obtener el usuario con su moto
        const { AppDataSource } = await import('../config/appdatasource');
        const { Usuario } = await import('../entities/usuario');
        const usuarioRepo = AppDataSource.getRepository(Usuario);

        const usuario = await usuarioRepo.findOne({
            where: { idUsuario: userId },
            relations: ['moto']
        });

        if (!usuario) {
            res.status(404).json(BaseResponse.error('Usuario no encontrado', 404));
            return;
        }

        if (!usuario.moto) {
            res.status(404).json(BaseResponse.error('El usuario no tiene una moto asignada', 404));
            return;
        }

        const numeroMoto = usuario.moto.numeroMoto;

        // Obtener la programación filtrada por el numeroMoto del usuario
        const programacionPersonal = await programacionAutomaticaService.obtenerMiProgramacionVisual(fecha, numeroMoto);

        if (programacionPersonal.paraderos.length === 0) {
            res.status(404).json(BaseResponse.error(`No se encontró programación para tu moto (${numeroMoto}) en la fecha ${fecha}`, 404));
            return;
        }

        res.status(200).json(BaseResponse.success(
            programacionPersonal,
            'Programación personal obtenida exitosamente'
        ));
    } catch (error) {
        console.error('Error al obtener programación personal:', error);
        res.status(500).json(BaseResponse.error(error.message));
    }
};
