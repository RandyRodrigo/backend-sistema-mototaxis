import { Request, Response } from "express";
import BaseResponse from "../shared/base.response";
import { actualizarParaderoSchema, insertarParaderoSchema } from "../validators/paradero.schema";
import * as paraderoService from "../services/paradero.service";

export const insertarParadero = async (req: Request, res: Response) => {
    try {
        const { error } = insertarParaderoSchema.validate(req.body);
        if (error) {
            res.status(400).json(BaseResponse.error(error.message, 400));
            return;
        }

        const nuevoParadero = await paraderoService.insertarParadero(req.body);
        res.status(201).json(BaseResponse.success(nuevoParadero, 'Paradero registrado correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}

export const listarParaderos = async (req: Request, res: Response) => {
    try {
        const paraderos = await paraderoService.listarParaderos();
        res.status(200).json(BaseResponse.success(paraderos, 'Paraderos obtenidos correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}

export const actualizarParadero = async (req: Request, res: Response) => {
    try {
        const { error } = actualizarParaderoSchema.validate(req.body);
        if (error) {
            res.status(400).json(BaseResponse.error(error.message, 400));
            return;
        }
        const { idParadero } = req.body;

        const paraderoActualizado = await paraderoService.actualizarParadero(idParadero, req.body);
        res.status(200).json(BaseResponse.success(paraderoActualizado, 'Paradero actualizado correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}
