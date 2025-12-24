import { Request, Response } from "express";
import BaseResponse from "../shared/base.response";
import * as turnoService from "../services/turno.service";
import { insertarTurnoSchema } from "../validators/turno.schema";

export const listarTurnos = async (req: Request, res: Response) => {
    try {
        const turnos = await turnoService.listarTurnos();
        res.status(200).json(BaseResponse.success(turnos, 'Turnos obtenidos correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}

export const insertarTurno = async (req: Request, res: Response) => {
    try {
        const { error } = insertarTurnoSchema.validate(req.body);
        if (error) {
            res.status(400).json(BaseResponse.error(error.message, 400));
            return;
        }

        const nuevoTurno = await turnoService.insertarTurno(req.body);
        res.status(201).json(BaseResponse.success(nuevoTurno, 'Turno creado correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}

export const eliminarTurno = async (req: Request, res: Response) => {
    try {
        const { idTurno } = req.params;
        const turno = await turnoService.obtenerTurnoPorId(Number(idTurno));
        
        if (!turno) {
            res.status(404).json(BaseResponse.error('Turno no encontrado', 404));
            return;
        }

        await turnoService.eliminarTurno(Number(idTurno));
        res.status(200).json(BaseResponse.success(null, 'Turno eliminado correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}
