import { Request, Response } from "express";
import * as usuarioService from "../services/usuario.service";
import BaseResponse from "../shared/base.response";
import { insertarUsuarioSchema } from "../validators/usuario.schema";
import { encriptarClave, generarUUID } from "../shared/util";

export const insertarUsuario = async (req: Request, res: Response) => {
    try {
        const { error } = insertarUsuarioSchema.validate(req.body);
        if (error) {
            res.status(400).json(BaseResponse.error(error.message, 400));
            return;
        }

        const { nombreUsuario, nombre, apellidoPaterno, apellidoMaterno, correo, telefono, clave } = req.body;

        const usuarioRegistrado = await usuarioService.obtenerUsuarioConClavePorCorreo(correo);
        if (usuarioRegistrado) {
            res.status(400).json(BaseResponse.error("El usuario con ese correo ya existe", 400));
            return;
        }

        const claveEncriptada = await encriptarClave(clave);
        const usuario = {
            idUsuario: generarUUID(),
            nombreUsuario,
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