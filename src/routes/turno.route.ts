import { Router } from "express";
import { eliminarTurno, insertarTurno, listarTurnos, actualizarTurno } from "../controllers/turno.controller";

const router = Router();

router.get('/', listarTurnos);
router.post('/insertar', insertarTurno);
router.delete('/eliminar/:idTurno', eliminarTurno);
router.patch('/actualizar', actualizarTurno);

export default router;
