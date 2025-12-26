import { Request, Response } from "express";
import BaseResponse from "../shared/base.response";
import { actualizarMotoSchema, asignarUsuarioAMotoSchema, insertarMotoSchema } from "../validators/moto.schema";
import * as motoService from "../services/moto.service";
import { obtenerUsuarioPorId } from "../services/usuario.service";

export const insertarMoto = async (req: Request, res: Response) => {
    try {
        const { error } = insertarMotoSchema.validate(req.body);
        if (error) {
            res.status(400).json(BaseResponse.error(error.message, 400));
            return;
        }

        const { numeroMoto } = req.body;

        const motoRegistrada = await motoService.obtenerMotoPorNumeroMoto(numeroMoto);
        if (motoRegistrada) {
            res.status(400).json(BaseResponse.error("Numero de moto ya registrado", 400));
            return;
        }
        const nuevaMoto = await motoService.insertarMoto({numeroMoto});
        res.status(201).json(BaseResponse.success(nuevaMoto, 'Moto registrada correctamente'));
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}

export const listarMotos = async (req: Request, res: Response) => {
    try {
        const motos = await motoService.listarMotos();
        res.status(200).json(BaseResponse.success(motos, 'Motos obtenidas correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}

export const listarMotosDisponibles = async (req: Request, res: Response) => {
    try {
        const motosDisponibles = await motoService.listarMotosDisponibles();
        res.status(200).json(BaseResponse.success(motosDisponibles, 'Motos disponibles obtenidas correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}

export const asignarUsuarioAMoto = async (req: Request, res: Response) => {
    try {
        const { error } = asignarUsuarioAMotoSchema.validate(req.body);
        if (error) {
            res.status(400).json(BaseResponse.error(error.message, 400));
            return;
        }

        const { numeroMoto } = req.body;
        const idUsuario = req.user?.idUsuario; // Viene del token JWT

        if (!idUsuario) {
            res.status(401).json(BaseResponse.error("Usuario no autenticado", 401));
            return;
        }

        // Verificar que la moto existe y está disponible
        const moto = await motoService.obtenerMotoPorNumeroMoto(numeroMoto);
        if (!moto) {
            res.status(404).json(BaseResponse.error("Moto no encontrada", 404));
            return;
        }

        // Verificar que el usuario existe
        if (!(await obtenerUsuarioPorId(idUsuario))) {
            res.status(404).json(BaseResponse.error("Usuario no encontrado", 404));
            return;
        }

        const motoAsignada = await motoService.asignarUsuarioAMoto(numeroMoto, idUsuario);
        res.status(200).json(BaseResponse.success(motoAsignada, 'Moto asignada correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}

export const obtenerMotoUsuario = async (req: Request, res: Response) => {
    try {
        const idUsuario = req.user?.idUsuario;

        if (!idUsuario) {
            res.status(401).json(BaseResponse.error("Usuario no autenticado", 401));
            return;
        }

        const moto = await motoService.obtenerMotoPorIdUsuario(idUsuario);

        res.status(200).json(BaseResponse.success(moto, 'Moto obtenida correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}

export const actualizarMoto = async (req: Request, res: Response) => {
    try {
        const { error } = actualizarMotoSchema.validate(req.body);
        if (error) {
            res.status(400).json(BaseResponse.error(error.message, 400));
            return;
        }

        const { idMoto } = req.body;

        const moto = await motoService.obtenerMotoPorId(idMoto);
        if (!moto) {
            res.status(404).json(BaseResponse.error("Moto no encontrada", 404));
            return;
        }

        const motoActualizada = await motoService.actualizarMoto(idMoto, req.body);
        res.status(200).json(BaseResponse.success(motoActualizada, 'Moto actualizada correctamente'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}