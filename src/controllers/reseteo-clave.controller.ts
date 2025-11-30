import { Request, Response } from "express";
import * as mailService from "../services/mail.service";
import * as usuarioService from "../services/usuario.service";
import * as reseteoClaveService from "../services/reseteo-clave.service";
import BaseResponse from "../shared/base.response";

export const solicitarRecuperacionClave = async (req: Request, res: Response) => {
    try {
        const { correo } = req.body;
        const usuario = await usuarioService.obtenerUsuarioPorCorreo(correo);
        console.log('usuario', usuario);
        if (usuario) {
            const reseteoClave = await reseteoClaveService.insertarReseteoClave({usuario});
            const enlaceReseteo = `http://localhost:3000/resetear-clave/${reseteoClave.idReseteoClave}`;
            const dataMail = {
                nombre: usuario.nombre,
                enlace: enlaceReseteo
            };
            await mailService.enviarCorreo(correo, 'Recuperación de Clave', 'recuperacion-clave', dataMail);
        }
        res.json(BaseResponse.success('Se ha enviado un correo con el enlace para recuperar su clave'));
    } catch (error) {
        console.error(error);
        res.status(500).json(BaseResponse.error(error.message));
    }
};