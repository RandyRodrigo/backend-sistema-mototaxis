import { Request, Response } from "express";
import * as usuarioService from "../services/usuario.service";
import BaseResponse from "../shared/base.response";
import { insertarUsuarioSchema, loginUsuarioSchema, actualizarUsuarioSchema } from "../validators/usuario.schema";
import { encriptarClave, generarUUID, compararClave } from "../shared/util";
import { MensajeResponseEnum } from "../enums/mensaje.enums";

export const insertarUsuario = async (req: Request, res: Response) => {
    try {
        const { error } = insertarUsuarioSchema.validate(req.body);
        if (error) {
            res.status(400).json(BaseResponse.error(error.message, 400));
            return;
        }

        const { nombre, apellidoPaterno, apellidoMaterno, correo, telefono, clave } = req.body;

        const usuarioRegistrado = await usuarioService.obtenerUsuarioConClavePorCorreo(correo);
        if (usuarioRegistrado) {
            res.status(400).json(BaseResponse.error("El usuario con ese correo ya existe", 400));
            return;
        }

        const claveEncriptada = await encriptarClave(clave);
        const usuario = {
            idUsuario: generarUUID(),
            nombre,
            apellidoPaterno,
            apellidoMaterno,
            correo,
            telefono,
            clave: claveEncriptada
        };

        const nuevoUsuario = await usuarioService.insertarUsuario(usuario);
        res.status(201).json(BaseResponse.success(nuevoUsuario, 'Usuario registrado correctamente'));
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}

export const actualizarUsuario = async (req: Request, res: Response) => {
    try {
        const { error } = actualizarUsuarioSchema.validate(req.body);
        if (error) {
            res.status(400).json(BaseResponse.error(error.message, 400));
            return;
        }

        const { idUsuario, ...dataToUpdate } = req.body;

        const usuarioActualizado = await usuarioService.actualizarUsuario(idUsuario, dataToUpdate);

        if (!usuarioActualizado) {
            res.status(404).json(BaseResponse.error("Usuario no encontrado", 404));
            return;
        }

        res.status(200).json(BaseResponse.success(usuarioActualizado, 'Usuario actualizado correctamente'));

    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}

export const loginUsuario = async (req: Request, res: Response) => {
    try {
        const { error } = loginUsuarioSchema.validate(req.body);
        if (error) {
            res.status(400).json(BaseResponse.error(error.message, 400));
            return;
        }

        const { correo, clave } = req.body;
        const usuarioConClave = await usuarioService.obtenerUsuarioConClavePorCorreo(correo);
        if (!usuarioConClave) {
            res.status(400).json(BaseResponse.error("Usuario y/o clave incorrectos", 400));
            return;
        }
        const claveValida = await compararClave(clave, usuarioConClave.clave);
        if (!claveValida) {
            res.status(400).json(BaseResponse.error("Usuario y/o clave incorrectos", 400));
            return;
        }
        const usuario = await usuarioService.obtenerUsuario(usuarioConClave.idUsuario);
        res.status(200).json(BaseResponse.success(usuario, 'Inicio de sesión exitoso'));
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
}

export const listarUsuarios = async (req: Request, res: Response) => {
    try {
        const Usuarios = await usuarioService.listarUsuarios();
        if (!Usuarios) {
            res.status(400).json(BaseResponse.error(MensajeResponseEnum.NOT_FOUND, 400));
        }
        res.status(200).json(BaseResponse.success(Usuarios, 'Lista de Usuarios'));

    } catch (error) {
        console.error(error)
        res.status(500).json(BaseResponse.error(error.message));
    }
}
