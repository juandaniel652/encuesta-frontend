/**
 * Constants and Configuration
 * Centraliza todas las constantes de la aplicación
 */

export const API_CONFIG = {
  // La URL base se toma de window.__API_BASE__ definida en index.html
  // Fallback a la URL por defecto si no está definida
  get BACKEND_URL() {
    return window.__API_BASE__ || 'https://backend-encuesta-cb7k.onrender.com/api';
  }
};

export const UI_CONFIG = {
  MAX_CONTENT_WIDTH: '600px',
  ANIMATION_DURATION: '0.3s'
};

export const CLIENT_TYPES = {
  WITH_CLIENTS: 'with_clients',
  WITHOUT_CLIENTS: 'without_clients'
};

export const QUESTION_TYPES = {
  SINGLE: 'single',
  MULTIPLE: 'multiple'
};

// Log de configuración (solo en desarrollo)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('⚙️ API Config:', API_CONFIG.BACKEND_URL);
}