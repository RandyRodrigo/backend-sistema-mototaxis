import { Router } from "express";
import * as asistenciaController from "../controllers/asistencia.controller";

const router = Router();

router.post('/entrada', asistenciaController.registrarEntrada);
router.patch('/salida', asistenciaController.registrarSalida);
router.get('/', asistenciaController.obtenerAsistencias);

export default router;
