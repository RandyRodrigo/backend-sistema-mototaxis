import { Router } from "express";
import { eliminarTurno, insertarTurno, listarTurnos, actualizarTurno } from "../controllers/turno.controller";

const router = Router();

router.get('/', listarTurnos);
router.post('/insertar-turno', insertarTurno);
router.delete('/eliminar-turno/:idTurno', eliminarTurno);
router.patch('/actualizar', actualizarTurno);

export default router;
