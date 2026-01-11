import { Request, Response } from "express";
import BaseResponse from "../shared/base.response";
import { registrarEntradaSchema, registrarSalidaSchema, obtenerAsistenciasSchema } from "../validators/asistencia.schema";
import * as asistenciaService from "../services/asistencia.service";

export const registrarEntrada = async (req: Request, res: Response) => {
    try {
        const { error } = registrarEntradaSchema.validate(req.body);
        if (error) {
            res.status(400).json(BaseResponse.error(error.message, 400));
            return;
        }

        const nuevaAsistencia = await asistenciaService.registrarEntrada(req.body);
        res.status(201).json(BaseResponse.success(nuevaAsistencia, 'Entrada registrada correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}

export const registrarSalida = async (req: Request, res: Response) => {
    try {
        const { error } = registrarSalidaSchema.validate(req.body);
        if (error) {
            res.status(400).json(BaseResponse.error(error.message, 400));
            return;
        }

        const { idAsistencia, ...rest } = req.body;
        const asistenciaActualizada = await asistenciaService.registrarSalida(idAsistencia, rest);

        if (!asistenciaActualizada) {
            res.status(404).json(BaseResponse.error('Asistencia no encontrada', 404));
            return;
        }

        res.status(200).json(BaseResponse.success(asistenciaActualizada, 'Salida registrada correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}

export const obtenerAsistencias = async (req: Request, res: Response) => {
    try {
        const { error } = obtenerAsistenciasSchema.validate(req.query);
        if (error) {
            res.status(400).json(BaseResponse.error(error.message, 400));
            return;
        }

        const { idProgramacion } = req.query as any;
        const asistencias = await asistenciaService.obtenerAsistencias(idProgramacion);
        res.status(200).json(BaseResponse.success(asistencias, 'Asistencias obtenidas correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}
