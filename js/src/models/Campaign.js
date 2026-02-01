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

  static fromJSON(data) {
    return new Campaign({
      id: data.id,
      name: data.name,
      clientType: data.client_type,
      dateStart: data.date_start,
      dateEnd: data.date_end,
      questions: data.questions || []   // 🔑 CLAVE
    });
  }
}
