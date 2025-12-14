import { Router } from "express";
import { insertarUsuario, loginUsuario, listarUsuarios, actualizarUsuario } from "../controllers/usuario.controller";

const router = Router();

router.post("/registro", insertarUsuario);
router.post("/login", loginUsuario);
router.get("/", listarUsuarios);
router.patch("/actualizar", actualizarUsuario);

export default router;
