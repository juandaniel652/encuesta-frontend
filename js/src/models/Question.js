import { QUESTION_TYPES } from '../config/constants.js';

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

  // 🔑 NECESARIO para Campaign.fromJSON
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
