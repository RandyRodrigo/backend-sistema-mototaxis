import { Router } from "express";
import { insertarUsuario, loginUsuario } from "../controllers/usuario.controller";

const router = Router();

router.post("/registro", insertarUsuario);
router.post("/login", loginUsuario);

export default router;