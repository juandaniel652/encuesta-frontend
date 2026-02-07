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
            { id: crypto.randomUUID(), text: 'Opción 1' },
            { id: crypto.randomUUID(), text: 'Opción 2' }
          ];
  }

  updateText(text) {
    this.text = text;
  }

  addOption(text = 'Nueva opción') {
    this.options.push({
      id: crypto.randomUUID(),
      text
    });
  }

  updateOption(index, value) {
    if (index >= 0 && index < this.options.length) {
      this.options[index].text = value;
    }
  }

  removeOption(index) {
    if (this.options.length > 1) {
      this.options.splice(index, 1);
    }
  }

  validate() {
    const errors = [];

    if (!this.text || this.text.trim() === '') {
      errors.push('El texto de la pregunta es obligatorio');
    }

    if (this.options.length < 2) {
      errors.push('Debe haber al menos 2 opciones');
    }

    const emptyOptions = this.options.filter(
      opt => !opt.text || opt.text.trim() === ''
    );

    if (emptyOptions.length > 0) {
      errors.push('Todas las opciones deben tener texto');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    return {
      id: this.id,
      text: this.text,
      type: this.type,
      options: this.options.map(o => ({
        id: o.id,
        text: o.text
      }))
    };
  }

  static fromJSON(data) {
    const rawOptions = data.options || data.question_options || [];

    return new Question({
      id: data.id,
      text: data.text,
      type: data.type,
      options: rawOptions.map(o => ({
        id: o.id,
        text: o.text
      }))
    });
  }
}
