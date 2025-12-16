import { Request, Response } from "express";
import BaseResponse from "../shared/base.response";
import { registrarAsistenciaSchema, obtenerAsistenciasPorMotoSchema } from "../validators/asistencia.schema";
import * as asistenciaService from "../services/asistencia.service";

export const registrarAsistencia = async (req: Request, res: Response) => {
    try {
        const { error } = registrarAsistenciaSchema.validate(req.body);
        if (error) {
            res.status(400).json(BaseResponse.error(error.message, 400));
            return;
        }

        const nuevaAsistencia = await asistenciaService.registrarAsistencia(req.body);
        res.status(201).json(BaseResponse.success(nuevaAsistencia, 'Asistencia registrada correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}

export const obtenerAsistenciasPorMoto = async (req: Request, res: Response) => {
    try {
        const { error } = obtenerAsistenciasPorMotoSchema.validate(req.body);
        if (error) {
            res.status(400).json(BaseResponse.error(error.message, 400));
            return;
        }

        const { numeroMoto } = req.body;
        const asistencias = await asistenciaService.obtenerAsistenciasPorMoto(numeroMoto);
        res.status(200).json(BaseResponse.success(asistencias, 'Asistencias obtenidas correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}
