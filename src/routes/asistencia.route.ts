import { Router } from "express";
import { registrarAsistencia, obtenerAsistenciasPorMoto } from "../controllers/asistencia.controller";

const router = Router();

router.post('/marcar-asistencia', registrarAsistencia);
router.post('/obtener-por-moto', obtenerAsistenciasPorMoto);

export default router;
