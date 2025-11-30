import { Router } from "express";
import { solicitarRecuperacionClave } from "../controllers/reseteo-clave.controller";

const router = Router();

router.post('/solicitar-recuperacion-clave', solicitarRecuperacionClave);

export default router;
