/**
 * Storage Service
 * Maneja toda la interacción con localStorage
 */

import { STORAGE_KEYS } from '../config/constants.js';

/**
 * Clase para manejar el almacenamiento de campañas
 */
class StorageService {
  /**
   * Lee datos del localStorage de forma segura
   * @param {string} key - Clave de localStorage
   * @param {*} defaultValue - Valor por defecto si hay error
   * @returns {*} Datos parseados o valor por defecto
   */
  _readFromStorage(key, defaultValue = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error reading from storage (${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * Escribe datos en localStorage
   * @param {string} key - Clave de localStorage
   * @param {*} data - Datos a guardar
   */
  _writeToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing to storage (${key}):`, error);
      throw new Error('No se pudo guardar en localStorage');
    }
  }

  // Métodos para Campañas
  readCampaigns() {
    return this._readFromStorage(STORAGE_KEYS.CAMPAIGNS, []);
  }

  writeCampaigns(campaigns) {
    this._writeToStorage(STORAGE_KEYS.CAMPAIGNS, campaigns);
  }

  // Métodos para Respuestas
  readResponses() {
    return this._readFromStorage(STORAGE_KEYS.RESPONSES, []);
  }

  writeResponses(responses) {
    this._writeToStorage(STORAGE_KEYS.RESPONSES, responses);
  }

  /**
   * Limpia todo el almacenamiento
   */
  clearAll() {
    localStorage.removeItem(STORAGE_KEYS.CAMPAIGNS);
    localStorage.removeItem(STORAGE_KEYS.RESPONSES);
  }

  /**
   * Exporta todos los datos
   * @returns {Object} Objeto con campañas y respuestas
   */
  exportAll() {
    return {
      campaigns: this.readCampaigns(),
      responses: this.readResponses(),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Importa datos desde un objeto
   * @param {Object} data - Datos a importar
   * @returns {boolean} True si la importación fue exitosa
   */
  importAll(data) {
    if (!Array.isArray(data.campaigns) || !Array.isArray(data.responses)) {
      throw new Error('Formato de datos inválido');
    }
    this.writeCampaigns(data.campaigns);
    this.writeResponses(data.responses);
    return true;
  }
}

// Exportar instancia singleton
export const storageService = new StorageService();