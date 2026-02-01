import { CLIENT_TYPES } from '../config/constants.js';

export class Campaign {
  constructor(data = {}) {
    this.id = data.id || null; // backend genera el id
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
  }

  static fromJSON(json) {
    return new Campaign(json);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      clientType: this.clientType,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      questions: this.questions
    };
  }
}
