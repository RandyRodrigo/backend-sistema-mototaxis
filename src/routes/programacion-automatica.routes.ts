import { Router } from 'express';
import { generarProgramacionDiaSiguiente, obtenerProgramacionMañana, obtenerProgramacionVisualPorFecha, obtenerProgramacionPorFecha, registrarOrdenLlegada, eliminarProgramacionPorFecha, obtenerMiProgramacionPorFecha } from '../controllers/programacion-automatica.controller';
import { generarComite24, eliminarComite24 } from '../controllers/programacion-comite24.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * POST /api/programacion-automatica/generar
 * Genera la programación para el día siguiente
 * Solo admin - También se ejecuta automáticamente a las 6pm
 */
router.post('/generar', verificarToken, generarProgramacionDiaSiguiente);

/**
 * GET /api/programacion-automatica/mañana
 * Obtiene la programación del día de mañana
 * Para que conductores vean su asignación
 */
router.get('/mañana', verificarToken, obtenerProgramacionMañana);

/**
 * GET /api/programacion-automatica/mi-programacion/:fecha
 * Obtiene la programación personal del usuario autenticado para una fecha
 * NUEVO: Filtrado por numeroMoto del usuario
 * IMPORTANTE: Esta ruta debe estar ANTES de /visual/:fecha y /:fecha para evitar conflictos
 */
router.get('/mi-programacion/:fecha', verificarToken, obtenerMiProgramacionPorFecha);

/**
 * GET /api/programacion-automatica/visual/:fecha
 * Obtiene la programación en formato visual agrupado por paradero y turno
 * NUEVO: Optimizado para visualización en frontend
 * IMPORTANTE: Esta ruta debe estar ANTES de /:fecha para evitar conflictos
 */
router.get('/visual/:fecha', verificarToken, obtenerProgramacionVisualPorFecha);

/**
 * GET /api/programacion-automatica/:fecha
 * Obtiene la programación de una fecha específica
 */

router.get('/:fecha', verificarToken, obtenerProgramacionPorFecha);

/**
 * POST /api/programacion-automatica/orden-llegada
 * Registra el orden de llegada en Mormones para Comité 24
 */
router.post('/orden-llegada', verificarToken, registrarOrdenLlegada);

/**
 * POST /api/programacion-automatica/generar-comite24
 * Genera programación de Comité 24 basada en orden de llegada
 * Se ejecuta automáticamente a las 8:30 AM o manualmente
 */
router.post('/generar-comite24', verificarToken, generarComite24);

/**
 * DELETE /api/programacion-automatica/comite24/:fecha
 * Elimina la programación de Comité 24 de una fecha específica
 */
router.delete('/comite24/:fecha', verificarToken, eliminarComite24);

/**
 * DELETE /api/programacion-automatica/:fecha
 * Elimina la programación de una fecha (solo admin)
 */
router.delete('/:fecha', verificarToken, eliminarProgramacionPorFecha);

export default router;
