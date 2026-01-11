import { Router } from "express";
import { actualizarProgramacion, insertarProgramacion, listarProgramacion, obtenerProgramacionDeHoyPorMoto } from "../controllers/programacion.controller";

const router = Router();

router.get('/', listarProgramacion);
router.post('/insertar', insertarProgramacion);
router.patch('/actualizar', actualizarProgramacion)
router.get('/mi-programacion', obtenerProgramacionDeHoyPorMoto)

export default router;
