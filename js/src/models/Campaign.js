import { CLIENT_TYPES } from '../config/constants.js';

export class Campaign {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || 'Campaña sin nombre';

    this.clientType =
      data.clientType ||
      data.client_type ||
      CLIENT_TYPES.WITHOUT_CLIENTS;

    this.dateStart =
      data.dateStart ||
      data.date_start ||
      new Date().toISOString();

    this.dateEnd =
      data.dateEnd ||
      data.date_end ||
      null;

    this.questions = data.questions || [];
    this.updatedAt = data.updatedAt || null;
  }

  addQuestion(question) {
    this.questions.push(question);
    this.updatedAt = new Date().toISOString();
  }

  removeQuestion(questionId) {
    this.questions = this.questions.filter(q => q.id !== questionId);
    this.updatedAt = new Date().toISOString();
  }

  update(data = {}) {
    if (data.name !== undefined) this.name = data.name;
    if (data.clientType !== undefined) this.clientType = data.clientType;
    if (data.dateStart !== undefined) this.dateStart = data.dateStart;
    if (data.dateEnd !== undefined) this.dateEnd = data.dateEnd;
    if (data.questions !== undefined) this.questions = data.questions;

    this.updatedAt = new Date().toISOString();
  }

  // models/Campaign.js
static fromJSON(data) {
  return new Campaign({
    id: data.id,
    name: data.name,
    clientType: data.client_type,
    dateStart: data.date_start,
    dateEnd: data.date_end,
    questions: (data.questions || []).map(q => ({
      id: q.id,
      text: q.text,
      type: q.type,
      options: (q.question_options || []).map(o => ({
        id: o.id,
        text: o.text
      }))
    })),
    updatedAt: data.updated_at
  });
}


toJSON() {
  return {
    id: this.id,
    name: this.name,
    clientType: this.client_type,
    dateStart: this.dateStart,
    dateEnd: this.dateEnd,
    questions: this.questions.map((q, index) => ({
      id: q.id,
      text: q.text,
      type: q.type,
      position: index,
      options: q.options || []
    }))
  };
}


}
