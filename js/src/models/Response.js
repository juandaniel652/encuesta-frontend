/**
 * Response Model
 * Define la estructura de una respuesta de encuesta
 */
/**
 * Clase que representa una Respuesta de encuesta
 */
export class Response {
  constructor(data = {}) {
    this.id = data.id || null;
    this.campaignId = data.campaignId || null;
    this.clientNumber = data.clientNumber || '';
    this.clientName = data.clientName || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.answers = data.answers || [];
  }

  /**
   * Añade una respuesta a una pregunta
   * @param {string} questionId - ID de la pregunta
   * @param {Array<string>} response - Respuestas seleccionadas
   */
  addAnswer(questionId, response) {
    this.answers.push({
      questionId,
      response
    });
  }

  /**
   * Obtiene la respuesta de una pregunta específica
   * @param {string} questionId - ID de la pregunta
   * @returns {Array<string>|null} Respuestas o null
   */
  getAnswer(questionId) {
    const answer = this.answers.find(a => a.questionId === questionId);
    return answer ? answer.response : null;
  }

  /**
   * Valida que la respuesta esté completa
   * @param {Array} questions - Lista de preguntas de la campaña
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate(questions) {
    const errors = [];
    
    if (!this.clientNumber || this.clientNumber.trim() === '') {
      errors.push('El número de cliente es obligatorio');
    }
    
    if (!this.clientName || this.clientName.trim() === '') {
      errors.push('El nombre del cliente es obligatorio');
    }
    
    // Verificar que todas las preguntas tengan respuesta
    questions.forEach(question => {
      const answer = this.getAnswer(question.id);
      if (!answer || answer.length === 0) {
        errors.push(`Falta responder: ${question.text}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Serializa la respuesta a JSON
   * @returns {Object} Objeto plano con los datos
   */
  toJSON() {
    return {
      id: this.id,
      campaignId: this.campaignId,
      clientNumber: this.clientNumber,
      clientName: this.clientName,
      createdAt: this.createdAt,
      answers: this.answers.map(a => ({...a}))
    };
  }

  /**
   * Crea una respuesta desde datos planos
   * @param {Object} data - Datos de la respuesta
   * @returns {Response} Instancia de Response
   */
  static fromJSON(data) {
    return new Response(data);
  }
}