import { Request, Response } from "express";
import * as mailService from "../services/mail.service";
import * as usuarioService from "../services/usuario.service";
import * as reseteoClaveService from "../services/reseteo-clave.service";
import BaseResponse from "../shared/base.response";
import { encriptarClave, getDiffMinutes } from "../shared/util";
import { MAX_TIME_PASSWORD_RESET_MINUTES } from "../shared/constants";
import { EstadoAuditoriaEnum } from "../enums/estado-auditoria.enums";
import { resetearClaveSchema } from "../validators/usuario.schema";
import { HTML_TEMPLATE_RESET_PASSWORD } from "../shared/templates";

export const solicitarRecuperacionClave = async (req: Request, res: Response) => {
    try {
        const { correo } = req.body;
        const usuario = await usuarioService.obtenerUsuarioPorCorreo(correo);
        console.log('usuario', usuario);
        if (usuario) {
            const reseteoClave = await reseteoClaveService.insertarReseteoClave({ usuario });
            const enlaceReseteo = `${process.env.FRONTEND_URL}/new-password/${reseteoClave.idReseteoClave}`;
            const dataMail = {
                nombre: usuario.nombre,
                enlace: enlaceReseteo
            };
            await mailService.enviarCorreo(correo, 'Recuperación de Clave', HTML_TEMPLATE_RESET_PASSWORD, dataMail);
            res.json(BaseResponse.success('Se ha enviado un correo con el enlace para recuperar su clave'));
        } else {
            res.json(BaseResponse.error('No se ha encontrado un usuario con ese correo'));
        }
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
};

export const validarReseteoClave = async (req: Request, res: Response) => {
    try {
        const { idReseteoClave } = req.params;
        const reseteoClave = await reseteoClaveService.validarTokenReseteoClave(idReseteoClave);
        if (!reseteoClave) {
            res.status(400).json(BaseResponse.error('Token no válido', 404));
            return;
        }
        if (reseteoClave.estadoAuditoria == EstadoAuditoriaEnum.INACTIVO || getDiffMinutes(reseteoClave.fechaCreacion) >= MAX_TIME_PASSWORD_RESET_MINUTES) {
            res.status(400).json(BaseResponse.error('Enlace no válido o expirado', 401));
            return;
        }
        res.json(BaseResponse.success('Enlace válido'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
};

export const cambiarClaveUsuario = async (req: Request, res: Response) => {
    try {
        const { error } = resetearClaveSchema.validate(req.body);
        if (error) {
            res.status(400).json(BaseResponse.error(error.message, 400));
            return;
        }
        const { idReseteoClave } = req.params;
        const { clave } = req.body;
        const { confirmarClave } = req.body;

        const registro = await reseteoClaveService.validarTokenReseteoClave(idReseteoClave);
        if (!registro) {
            res.status(400).json(BaseResponse.error('Token no válido', 404));
            return;
        }
        if (registro.estadoAuditoria == EstadoAuditoriaEnum.INACTIVO || getDiffMinutes(registro.fechaCreacion) >= MAX_TIME_PASSWORD_RESET_MINUTES) {
            res.status(400).json(BaseResponse.error('Enlace no válido o expirado', 401));
            return;
        }
        if (clave !== confirmarClave) {
            res.status(400).json(BaseResponse.error('Las claves no coinciden', 400));
            return;
        }
        const claveEncriptada = await encriptarClave(clave);
        const { usuario } = await reseteoClaveService.obtenerReseteoClavePorId(idReseteoClave);
        if (!usuario) {
            res.status(400).json(BaseResponse.error('Usuario no encontrado', 404));
            return;
        }
        //Actualiza clave de Usuario
        await usuarioService.cambiarClaveUsuario(usuario.idUsuario, claveEncriptada);
        //Actualiza estado de Reseteo de Clave
        await reseteoClaveService.cambiarEstadoReseteoClave(idReseteoClave);
        res.json(BaseResponse.success('Contraseña actualizada exitosamente'));

    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
};
