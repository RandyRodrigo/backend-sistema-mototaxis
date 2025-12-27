import { Router } from "express";
import { actualizarParadero, insertarParadero, listarParaderos } from "../controllers/paradero.controller";

const router = Router();

router.post('/insertar-paradero', insertarParadero);
router.get('/', listarParaderos);
router.patch('/actualizar-paradero', actualizarParadero);

export default router;
