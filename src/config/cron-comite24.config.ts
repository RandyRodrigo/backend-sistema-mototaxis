import cron from 'node-cron';
import { generarProgramacionComite24 } from '../services/programacion-comite24.service';

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD (zona horaria de Perú)
 */
const obtenerFechaHoyPeru = (): string => {
    const ahora = new Date();
    // Perú está en UTC-5
    const peruTime = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Lima' }));
    const year = peruTime.getFullYear();
    const month = String(peruTime.getMonth() + 1).padStart(2, '0');
    const day = String(peruTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Inicializa el cron job para generar Comité 24 automáticamente
 */
export const iniciarCronComite24 = () => {
    // Ejecutar todos los días a las 8:30 AM (hora de Perú)
    cron.schedule('30 8 * * *', async () => {
        const hoy = obtenerFechaHoyPeru();

        try {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`🚀 [CRON COMITÉ 24] Iniciando generación para ${hoy}...`);
            console.log(`⏰ Hora: ${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })}`);
            console.log(`${'='.repeat(60)}\n`);

            const programaciones = await generarProgramacionComite24(hoy);

            console.log(`\n${'='.repeat(60)}`);
            console.log(`✅ [CRON COMITÉ 24] Generación exitosa`);
            console.log(`   📊 Total asignaciones: ${programaciones.length}`);
            console.log(`   📅 Fecha: ${hoy}`);
            console.log(`${'='.repeat(60)}\n`);
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
