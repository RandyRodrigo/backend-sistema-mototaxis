import { Router } from "express";
import * as turnoController from "../controllers/turno.controller";

const router = Router();

router.get('/', turnoController.listarTurnos);
router.post('/insertar-turno', turnoController.insertarTurno);
router.delete('/eliminar-turno/:idTurno', turnoController.eliminarTurno);

export default router;
