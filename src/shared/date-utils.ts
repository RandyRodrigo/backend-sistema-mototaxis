/**
 * Utilidades para manejo de fechas en zona horaria de Perú (UTC-5)
 */

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD en zona horaria de Perú
 */
export function obtenerFechaHoyPeru(): string {
    const ahora = new Date();
    const peruOffset = -5 * 60; // UTC-5 en minutos
    const peruTime = new Date(ahora.getTime() + peruOffset * 60 * 1000);
    return peruTime.toISOString().split('T')[0];
}

/**
 * Obtiene la fecha y hora actual en zona horaria de Perú
 */
export function obtenerFechaHoraPeru(): Date {
    const ahora = new Date();
    const peruOffset = -5 * 60; // UTC-5 en minutos
    return new Date(ahora.getTime() + peruOffset * 60 * 1000);
}

/**
 * Convierte una fecha a zona horaria de Perú
 */
export function convertirAHoraPeru(fecha: Date): Date {
    const peruOffset = -5 * 60; // UTC-5 en minutos
    return new Date(fecha.getTime() + peruOffset * 60 * 1000);
}

/**
 * Obtiene la fecha de mañana en formato YYYY-MM-DD en zona horaria de Perú
 */
export function obtenerFechaMananaPeru(): string {
    const ahora = new Date();
    const peruOffset = -5 * 60; // UTC-5 en minutos
    const peruTime = new Date(ahora.getTime() + peruOffset * 60 * 1000);
    peruTime.setDate(peruTime.getDate() + 1);
    return peruTime.toISOString().split('T')[0];
}

/**
 * Formatea una fecha en formato legible para Perú
 */
export function formatearFechaPeru(fecha: Date): string {
    return fecha.toLocaleString('es-PE', { timeZone: 'America/Lima' });
}
