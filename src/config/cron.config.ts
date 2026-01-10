import cron from 'node-cron';
import * as programacionAutomaticaService from '../services/programacion-automatica.service';

/**
 * Cron job que se ejecuta todos los días a las 6:00 PM
 * Genera automáticamente la programación para el día siguiente
 */
export const iniciarCronProgramacionAutomatica = () => {
    // Ejecutar todos los días a las 18:00 (6:00 PM)
    cron.schedule('0 18 * * *', async () => {
        try {
            console.log('🕐 [CRON] Iniciando generación automática de programación...');

            // Calcular fecha del día siguiente
            const mañana = new Date();
            mañana.setDate(mañana.getDate() + 1);
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

    console.log('⏰ Cron job de programación automática iniciado (todos los días a las 6:00 PM)');
};
