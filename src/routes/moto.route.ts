import { Router } from "express";
import { insertarMoto, asignarUsuarioAMoto, listarMotosDisponibles, obtenerMotoUsuario, listarMotos, actualizarMoto } from "../controllers/moto.controller";
import { verificarToken } from "../middlewares/auth.middleware";

const router = Router();

router.get('/', listarMotos);
router.post('/insertar-moto', insertarMoto);
router.get('/motos-disponibles', listarMotosDisponibles);
router.put('/asignar-usuario-a-moto', verificarToken, asignarUsuarioAMoto);
router.get('/mi-moto', verificarToken, obtenerMotoUsuario);
router.patch('/actualizar-moto', verificarToken, actualizarMoto);

export default router;
