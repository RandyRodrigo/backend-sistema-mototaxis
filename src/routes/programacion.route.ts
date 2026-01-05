import { Router } from "express";
import { actualizarProgramacion, eliminarProgramacion, insertarProgramacion, listarProgramacion } from "../controllers/programacion.controller";

const router = Router();

router.get('/', listarProgramacion);
router.post('/insertar', insertarProgramacion);
router.patch('/actualizar', actualizarProgramacion)
router.delete('/eliminar-programacion/:idProgramacion', eliminarProgramacion);

export default router;
