import { Router } from "express";
import { registrarAsistencia } from "../controllers/asistencia.controller";

const router = Router();

router.post('/marcar-asistencia', registrarAsistencia);

export default router;
