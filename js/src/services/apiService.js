/**
 * API Service
 * Maneja todas las comunicaciones con el backend
 */

import { API_CONFIG } from '../config/constants.js';

/**
 * Clase para manejar las peticiones al backend
 */
class APIService {
  constructor() {
    this.baseURL = API_CONFIG.BACKEND_URL;
  }

  /**
   * Envía una respuesta de encuesta al backend
   * @param {Object} responseData - Datos de la respuesta
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async submitResponse(responseData) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(responseData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en submitResponse:', error);
      throw new Error(`No se pudo enviar la respuesta: ${error.message}`);
    }
  }

  /**
   * Maneja errores de red de forma consistente
   * @param {Error} error - Error capturado
   * @returns {string} Mensaje de error formateado
   */
  handleError(error) {
    if (error.message.includes('Failed to fetch')) {
      return 'Error de conexión. Verifica tu conexión a internet.';
    }
    return error.message || 'Error desconocido';
  }
}

// Exportar instancia singleton
export const apiService = new APIService();