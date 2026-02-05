/**
 * Question Model
 * Define la estructura y operaciones de una pregunta
 */

import { QUESTION_TYPES } from '../config/constants.js';

/**
 * Clase que representa una Pregunta
 */
export class Question {
  constructor(data = {}) {
    this.id = data.id || generateUID('q');
    this.text = data.text || 'Nueva pregunta';
    this.type = data.type || QUESTION_TYPES.SINGLE;
    this.options = data.options || ['Opción 1', 'Opción 2'];
  }

  /**
   * Actualiza el texto de la pregunta
   * @param {string} text - Nuevo texto
   */
  updateText(text) {
    this.text = text;
  }

  /**
   * Añade una opción a la pregunta
   * @param {string} option - Texto de la opción
   */
  addOption(option = 'Nueva opción') {
    this.options.push(option);
  }

  /**
   * Actualiza una opción específica
   * @param {number} index - Índice de la opción
   * @param {string} value - Nuevo valor
   */
  updateOption(index, value) {
    if (index >= 0 && index < this.options.length) {
      this.options[index] = value;
    }
  }

  /**
   * Elimina una opción por índice
   * @param {number} index - Índice de la opción a eliminar
   */
  removeOption(index) {
    if (this.options.length > 1) {
      this.options.splice(index, 1);
    }
  }

  /**
   * Valida que la pregunta esté completa
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];
    
    if (!this.text || this.text.trim() === '') {
      errors.push('El texto de la pregunta es obligatorio');
    }
    
    if (this.options.length < 2) {
      errors.push('Debe haber al menos 2 opciones');
    }
    
    const emptyOptions = this.options.filter(opt => !opt || opt.trim() === '');
    if (emptyOptions.length > 0) {
      errors.push('Todas las opciones deben tener texto');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Serializa la pregunta a JSON
   * @returns {Object} Objeto plano con los datos
   */
  toJSON() {
    return {
      id: this.id,
      text: this.text,
      type: this.type,
      options: [...this.options]
    };
  }

  /**
   * Crea una pregunta desde datos planos
   * @param {Object} data - Datos de la pregunta
   * @returns {Question} Instancia de Question
   */
  static fromJSON(data) {
    return new Question(data);
  }
}