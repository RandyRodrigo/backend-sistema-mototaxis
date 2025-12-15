import { Router } from "express";
import { insertarUsuario, loginUsuario, listarUsuarios, actualizarUsuario } from "../controllers/usuario.controller";
import { verificarToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/registro", insertarUsuario);
router.post("/login", loginUsuario);
router.get("/", listarUsuarios);
router.patch("/actualizar", verificarToken, actualizarUsuario);

export default router;
