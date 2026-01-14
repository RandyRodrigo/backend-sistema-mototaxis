import cron from 'node-cron';
import * as programacionAutomaticaService from '../services/programacion-automatica.service';
import { obtenerFechaHoyPeru, obtenerFechaMananaPeru } from '../shared/date-utils';

/**
 * Cron job que se ejecuta todos los días a las 6:00 PM
 * Genera automáticamente la programación para el día siguiente
 */
export const iniciarCronProgramacionAutomatica = () => {
    // CRON DE PRODUCCIÓN - Ejecutar todos los días a las 18:00 (6:00 PM)
    cron.schedule('0 18 * * *', async () => {
        try {
            console.log('🕐 [CRON] Iniciando generación automática de programación...');

            // Obtener fecha de mañana en zona horaria de Perú
            const fechaMañana = obtenerFechaMananaPeru();

            // Generar programación
            const programacion = await programacionAutomaticaService.generarProgramacionDiaria(fechaMañana);

            console.log(`✅ [CRON] Programación generada exitosamente para ${fechaMañana}`);
            console.log(`📊 [CRON] Total de asignaciones: ${programacion.length}`);
        } catch (error) {
            console.error('❌ [CRON] Error al generar programación automática:', error.message);
            // Aquí podrías enviar una notificación al admin
        }
    }, {
        timezone: "America/Lima" // Ajusta según tu zona horaria
    });

    // ⚠️ CRON DE PRUEBA - ELIMINAR DESPUÉS DE PROBAR
    // Se ejecuta cada minuto Y GENERA LA PROGRAMACIÓN REAL
    cron.schedule('* * * * *', async () => {
        try {
            const ahora = new Date();
            const horaActual = ahora.toLocaleString('es-PE', { timeZone: 'America/Lima' });

            console.log('\n🧪 ========================================');
            console.log(`🧪 [CRON TEST] Ejecutado a las: ${horaActual}`);

            // Obtener fechas usando utilidades centralizadas
            const fechaHoyPeru = obtenerFechaHoyPeru();
            const fechaMañana = obtenerFechaMananaPeru();

            console.log(`🧪 [CRON TEST] Fecha hoy en Perú: ${fechaHoyPeru}`);
            console.log(`🧪 [CRON TEST] Generando programación para: ${fechaMañana}`);

            // ⚠️ ESTO GENERA LA PROGRAMACIÓN REAL EN LA BASE DE DATOS
            const programacion = await programacionAutomaticaService.generarProgramacionDiaria(fechaMañana);

            console.log(`🧪 [CRON TEST] ✅ Programación generada exitosamente`);
            console.log(`🧪 [CRON TEST] 📊 Total de asignaciones: ${programacion.length}`);
            console.log('🧪 ========================================\n');
        } catch (error: any) {
            console.error('❌ [CRON TEST] Error:', error.message);
        }
    }, {
        timezone: "America/Lima"
    });

    console.log('⏰ Cron job de programación automática iniciado (todos los días a las 6:00 PM)');
    console.log('🧪 Cron de prueba iniciado (cada minuto) - RECUERDA ELIMINARLO DESPUÉS');
};
