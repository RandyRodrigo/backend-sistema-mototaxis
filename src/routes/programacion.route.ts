import { Router } from "express";
import { eliminarProgramacion, insertarProgramacion, listarProgramacion } from "../controllers/programacion.controller";

const router = Router();

router.get('/', listarProgramacion);
router.post('/insertar-programacion', insertarProgramacion);
router.delete('/eliminar-programacion/:idProgramacion', eliminarProgramacion);

export default router;
