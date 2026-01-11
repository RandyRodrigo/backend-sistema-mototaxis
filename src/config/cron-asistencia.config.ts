import cron from 'node-cron';
import * as asistenciaService from '../services/asistencia.service';

/**
 * Cron job que se ejecuta cada hora para marcar faltas automáticas
 * de turnos que ya terminaron
 */
export const iniciarCronAsistencia = () => {
    // Ejecutar cada hora en punto
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('🚨 [CRON ASISTENCIA] Verificando faltas automáticas...');
            const faltasMarcadas = await asistenciaService.marcarFaltasAutomaticas();
            console.log(`✅ [CRON ASISTENCIA] ${faltasMarcadas} faltas marcadas`);
        } catch (error: any) {
            console.error('❌ [CRON ASISTENCIA] Error al marcar faltas:', error.message);
        }
    }, {
        timezone: "America/Lima"
    });

    // Verificación final del día a las 11:59 PM
    cron.schedule('59 23 * * *', async () => {
        try {
            console.log('🚨 [CRON ASISTENCIA] Verificación final del día...');
            const faltasMarcadas = await asistenciaService.marcarFaltasAutomaticas();
            console.log(`✅ [CRON ASISTENCIA] Verificación final: ${faltasMarcadas} faltas marcadas`);
        } catch (error: any) {
            console.error('❌ [CRON ASISTENCIA] Error en verificación final:', error.message);
        }
    }, {
        timezone: "America/Lima"
    });

    console.log('⏰ Cron jobs de asistencia iniciados:');
    console.log('   - Cada hora: Marcar faltas automáticas');
    console.log('   - 11:59 PM: Verificación final del día');
};
