/**
 * Campaign Model
 * Define la estructura y operaciones de una campaña
 */

import { generateUID } from '../utils/helpers.js';
import { CLIENT_TYPES } from '../config/constants.js';

/**
 * Clase que representa una Campaña
 */
export class Campaign {
  constructor(data = {}) {
    this.id = data.id || generateUID('camp');
    this.name = data.name || 'Campaña sin nombre';
    this.dateStart = data.dateStart || null;
    this.dateEnd = data.dateEnd || null;
    this.questions = data.questions || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.clientType = data.clientType || CLIENT_TYPES.WITHOUT_CLIENTS;
  }

  /**
   * Actualiza los datos de la campaña
   * @param {Object} updates - Campos a actualizar
   */
  update(updates) {
    Object.assign(this, updates);
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Añade una pregunta a la campaña
   * @param {Question} question - Pregunta a añadir
   */
  addQuestion(question) {
    this.questions.push(question);
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Elimina una pregunta por ID
   * @param {string} questionId - ID de la pregunta a eliminar
   */
  removeQuestion(questionId) {
    this.questions = this.questions.filter(q => q.id !== questionId);
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Crea una copia de la campaña
   * @returns {Campaign} Nueva instancia de la campaña
   */
  duplicate() {
    const copy = new Campaign({
      ...this,
      id: generateUID('camp'),
      name: `${this.name} (copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    // Deep clone questions
    copy.questions = JSON.parse(JSON.stringify(this.questions));
    return copy;
  }

  /**
   * Valida que la campaña tenga datos completos
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim() === '') {
      errors.push('El nombre es obligatorio');
    }
    
    if (this.dateStart && this.dateEnd) {
      if (new Date(this.dateStart) > new Date(this.dateEnd)) {
        errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
      }
    }
    
    if (this.questions.length === 0) {
      errors.push('La campaña debe tener al menos una pregunta');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Serializa la campaña a JSON
   * @returns {Object} Objeto plano con los datos
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      questions: this.questions,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      clientType: this.clientType
    };
  }

  /**
   * Crea una campaña desde datos planos
   * @param {Object} data - Datos de la campaña
   * @returns {Campaign} Instancia de Campaign
   */
  static fromJSON(data) {
    return new Campaign(data);
  }
}