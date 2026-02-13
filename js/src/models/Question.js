export class Question {
  constructor(data = {}) {
    this.id = data.id || null;
    this.text = data.text || 'Nueva pregunta';
    this.type = data.type || QUESTION_TYPES.SINGLE;

    // SOLO lo que venga del backend
    this.options = Array.isArray(data.options)
    ? data.options
    : [];

  }

  // 🔥 NO usar más
  addOption() {
    throw new Error("addOption no se usa. Las opciones se crean vía backend.");
  }

  static fromJSON(data) {
    const rawOptions = data.options || data.question_options || [];

    return new Question({
      id: data.id,
      text: data.text,
      type: data.type,
      options: rawOptions.map(o => ({
        id: o.id,
        text: o.text,
        is_active: o.is_active
      }))
    });
  }
}
