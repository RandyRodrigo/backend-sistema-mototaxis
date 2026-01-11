import cron from 'node-cron';
import * as programacionAutomaticaService from '../services/programacion-automatica.service';

/**
 * Cron job que se ejecuta todos los días a las 6:00 PM
 * Genera automáticamente la programación para el día siguiente
 */
export const iniciarCronProgramacionAutomatica = () => {
    // CRON DE PRODUCCIÓN - Ejecutar todos los días a las 18:00 (6:00 PM)
    cron.schedule('0 18 * * *', async () => {
        try {
            console.log('🕐 [CRON] Iniciando generación automática de programación...');

            // Calcular fecha del día siguiente EN ZONA HORARIA DE PERÚ
            // Obtener la fecha actual en Perú
            const formatter = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'America/Lima',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            const fechaHoyPeru = formatter.format(new Date()); // Formato: YYYY-MM-DD

            // Sumar 1 día
            const [year, month, day] = fechaHoyPeru.split('-').map(Number);
            const mañana = new Date(year, month - 1, day + 1);
            const fechaMañana = mañana.toISOString().split('T')[0];

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

            // Calcular fecha del día siguiente EN ZONA HORARIA DE PERÚ
            const formatter = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'America/Lima',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            const fechaHoyPeru = formatter.format(new Date()); // Formato: YYYY-MM-DD

            // Sumar 1 día
            const [year, month, day] = fechaHoyPeru.split('-').map(Number);
            const mañana = new Date(year, month - 1, day + 1);
            const fechaMañana = mañana.toISOString().split('T')[0];

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
