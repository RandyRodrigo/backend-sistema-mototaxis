import { Router } from "express";
import { perfilUsuario,insertarUsuario, loginUsuario, listarUsuarios, actualizarUsuario, listarAdmins, listarConductores, modificarUsuario } from "../controllers/usuario.controller";
import { verificarToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/registro", insertarUsuario);
router.post("/login", loginUsuario);
router.get("/", listarUsuarios);
router.get("/admins", listarAdmins);
router.get("/conductores", listarConductores);
router.patch("/actualizar", verificarToken, actualizarUsuario);
router.patch("/modificar", verificarToken, modificarUsuario);
router.get("/perfil", verificarToken, perfilUsuario);

export default router;
