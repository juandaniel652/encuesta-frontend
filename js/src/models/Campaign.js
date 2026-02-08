import { CLIENT_TYPES } from '../config/constants.js';
import { Question } from './Question.js';

export class Campaign {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || 'Campaña sin nombre';

    this.clientType =
      data.clientType === CLIENT_TYPES.WITH_CLIENTS ||
      data.clientType === CLIENT_TYPES.WITHOUT_CLIENTS
        ? data.clientType
        : CLIENT_TYPES.WITHOUT_CLIENTS;

    this.dateStart =
      data.dateStart ||
      data.date_start ||
      new Date().toISOString();

    this.dateEnd =
      data.dateEnd ||
      data.date_end ||
      null;

    // 🔴 Regla: siempre instancias de Question
    this.questions = (data.questions || []).map(q =>
      q instanceof Question ? q : Question.fromJSON(q)
    );

    this.updatedAt = data.updatedAt || null;
  }

  addQuestion(question) {
    if (!(question instanceof Question)) {
      throw new Error('addQuestion espera una instancia de Question');
    }
    this.questions.push(question);
    this.updatedAt = new Date().toISOString();
  }

  removeQuestion(id) {
    this.questions = this.questions.filter(q => q.id !== id);
  }

  update(data = {}) {
    if (data.name !== undefined) this.name = data.name;
    if (data.clientType !== undefined) this.clientType = data.clientType;
    if (data.dateStart !== undefined) this.dateStart = data.dateStart;
    if (data.dateEnd !== undefined) this.dateEnd = data.dateEnd;

    if (data.questions !== undefined) {
      this.questions = data.questions.map(q =>
        q instanceof Question ? q : Question.fromJSON(q)
      );
    }

    this.updatedAt = new Date().toISOString();
  }

  // 🔹 Entrada desde backend
  static fromJSON(data) {
    return new Campaign({
      id: data.id,
      name: data.name,
      clientType: data.client_type,
      dateStart: data.date_start,
      dateEnd: data.date_end,
      questions: (data.questions || []).map(q =>
        Question.fromJSON(q)
      ),
      updatedAt: data.updated_at
    });
  }

  // 🔹 Salida hacia backend
  toJSON() {
    return {
      id: this.id,
      name: this.name || 'Campaña sin nombre',
      client_type: this.clientType,
      date_start: this.dateStart || new Date().toISOString(),
      date_end: this.dateEnd || null,
      questions: this.questions.map((q, index) => ({
        ...q.toJSON(),
        position: index
      }))
    };
  }
}
