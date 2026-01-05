import { Request, Response } from "express";
import BaseResponse from "../shared/base.response";
import * as programacionService from "../services/programacion.service";
import { actualizarProgramacionSchema, insertarProgramacionSchema } from "../validators/programacion.schema";

export const listarProgramacion = async (req: Request, res: Response) => {
    try {
        const programacion = await programacionService.listarProgramacion();
        res.status(200).json(BaseResponse.success(programacion, 'Programacion obtenida correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}

export const insertarProgramacion = async (req: Request, res: Response) => {
    try {
        const { error } = insertarProgramacionSchema.validate(req.body);
        if (error) {
            res.status(400).json(BaseResponse.error(error.message, 400));
            return;
        }

        const nuevaProgramacion = await programacionService.insertarProgramacion(req.body);
        res.status(201).json(BaseResponse.success(nuevaProgramacion, 'Programacion creada correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}

export const actualizarProgramacion = async (req: Request, res: Response) => {
  try {
    const { error } = actualizarProgramacionSchema.validate(req.body);
    if (error) {
        res.status(400).json(BaseResponse.error(error.message, 400));
        return;
    }
    const { idProgramacion } = req.body;
    const programacionActualizada = await programacionService.actualizarProgramacion(idProgramacion, req.body);
    res.status(200).json(BaseResponse.success(programacionActualizada, 'Programacion actualizada correctamente'));
  } catch {

  }
}

export const eliminarProgramacion = async (req: Request, res: Response) => {
    try {
        const { idProgramacion } = req.params;
        const programacion = await programacionService.obtenerProgramacionPorId(Number(idProgramacion));

        if (!programacion) {
            res.status(404).json(BaseResponse.error('Programacion no encontrada', 404));
            return;
        }

        await programacionService.eliminarProgramacion(Number(idProgramacion));
        res.status(200).json(BaseResponse.success(null, 'Programacion eliminada correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}
