import { Router } from "express";
import { insertarParadero, listarParaderos } from "../controllers/paradero.controller";

const router = Router();

router.post('/insertar-paradero', insertarParadero);
router.get('/', listarParaderos);

export default router;
