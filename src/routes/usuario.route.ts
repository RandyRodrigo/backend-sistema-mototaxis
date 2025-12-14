import { Router } from "express";
import { insertarUsuario, loginUsuario, listarUsuarios } from "../controllers/usuario.controller";

const router = Router();

router.post("/registro", insertarUsuario);
router.post("/login", loginUsuario);
router.get("/", listarUsuarios);

export default router;
