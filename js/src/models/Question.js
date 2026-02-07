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
    this.id = data.id || null;
    this.text = data.text || 'Nueva pregunta';
    this.type = data.type || QUESTION_TYPES.SINGLE;

    this.options =
      Array.isArray(data.options) && data.options.length > 0
        ? data.options
        : [
            { id: null, text: 'Opción 1' },
            { id: null, text: 'Opción 2' }
          ];
  }

  addOption(text = 'Nueva opción') {
    this.options.push({
      id: null,
      text
    });
  }
}