import { Router } from "express";
import { insertarUsuario } from "../controllers/usuario.controller";

const router = Router();

router.post("/registro", insertarUsuario);

export default router;