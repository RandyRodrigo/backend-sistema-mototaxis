import { Router } from "express";
import { insertarMoto, asignarUsuarioAMoto, listarMotosDisponibles, obtenerMotoUsuario } from "../controllers/moto.controller";
import { verificarToken } from "../middlewares/auth.middleware";

const router = Router();

router.post('/insertar-moto', insertarMoto);
router.get('/motos-disponibles', verificarToken, listarMotosDisponibles);
router.put('/asignar-usuario-a-moto', verificarToken, asignarUsuarioAMoto);
router.get('/mi-moto', verificarToken, obtenerMotoUsuario);

export default router;
