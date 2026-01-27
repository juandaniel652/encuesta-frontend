/**
 * Utility Functions
 * Funciones auxiliares reutilizables
 */

/**
 * Genera un ID único con prefijo
 * @param {string} prefix - Prefijo para el ID
 * @returns {string} ID único generado
 */
export function generateUID(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Escapa caracteres HTML para prevenir XSS
 * @param {*} str - String a escapar
 * @returns {string} String escapado
 */
export function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * Formatea un rango de fechas
 * @param {string} start - Fecha de inicio
 * @param {string} end - Fecha de fin
 * @returns {string} Rango formateado
 */
export function formatDateRange(start, end) {
  if (!start || !end) return 'Sin fechas';
  return `${new Date(start).toLocaleDateString()} — ${new Date(end).toLocaleDateString()}`;
}

/**
 * Descarga un objeto como archivo JSON
 * @param {Object} obj - Objeto a descargar
 * @param {string} filename - Nombre del archivo
 */
export function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Valida que todos los campos requeridos estén completos
 * @param {Object} fields - Objeto con los campos a validar
 * @returns {boolean} True si todos los campos son válidos
 */
export function validateRequiredFields(fields) {
  return Object.values(fields).every(value => {
    if (typeof value === 'string') return value.trim().length > 0;
    return value != null;
  });
}