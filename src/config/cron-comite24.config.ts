import cron from 'node-cron';
import { generarProgramacionComite24 } from '../services/programacion-comite24.service';
import { obtenerFechaHoyPeru } from '../shared/date-utils';

/**
 * Inicia el cron job para generar automáticamente la programación de Comité 24
 * Se ejecuta todos los días a las 8:30 AM (hora de Perú)
 */
export const iniciarCronComite24 = () => {
    // Ejecutar todos los días a las 8:30 AM (hora de Perú)
    cron.schedule('30 8 * * *', async () => {
        const hoy = obtenerFechaHoyPeru();

        try {
            console.log(`🚀 [CRON COMITÉ 24] Iniciando generación para ${hoy}...`);
            const programaciones = await generarProgramacionComite24(hoy);
            console.log(`✅ [CRON COMITÉ 24] Generación exitosa: ${programaciones.length} motos asignadas`);
        } catch (error: any) {
            console.error(`\n${'='.repeat(60)}`);
            console.error(`❌ [CRON COMITÉ 24] Error al generar programación`);
            console.error(`   📅 Fecha: ${hoy}`);
            console.error(`   💥 Error: ${error.message}`);
            console.error(`${'='.repeat(60)}\n`);
        }
    }, {
        timezone: 'America/Lima'
    });

    console.log('⏰ Cron job de Comité 24 iniciado (8:30 AM todos los días - Zona horaria: America/Lima)');
};
