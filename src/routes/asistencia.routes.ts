import { Router } from 'express';
import * as asistenciaController from '../controllers/asistencia.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas para conductores
router.post('/marcar', asistenciaController.marcarAsistencia);
router.get('/mi-programacion', asistenciaController.obtenerMiProgramacionHoy);
router.get('/mi-historial', asistenciaController.obtenerMiHistorial);

// Rutas para administradores
router.get('/orden-llegada/:fecha', asistenciaController.obtenerOrdenLlegada);
router.get('/reporte/:idParadero/:fecha', asistenciaController.obtenerReportePorParadero);
router.get('/faltas/:fecha', asistenciaController.obtenerFaltas);
router.get('/tardanzas/:fecha', asistenciaController.obtenerTardanzas);

export default router;
