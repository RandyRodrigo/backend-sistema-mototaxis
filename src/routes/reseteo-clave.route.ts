import { Router } from "express";
import { solicitarRecuperacionClave, validarReseteoClave, cambiarClaveUsuario } from "../controllers/reseteo-clave.controller";

const router = Router();

router.post('/solicitud-recuperacion', solicitarRecuperacionClave);
router.get('/validacion/:idReseteoClave', validarReseteoClave);
router.patch('/cambio-clave/:idReseteoClave', cambiarClaveUsuario);

export default router;
