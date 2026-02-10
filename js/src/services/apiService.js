// apiService.js
import { API_CONFIG } from '../config/constants.js';

class APIService {
  constructor() {
    this.baseURL = API_CONFIG.BACKEND_URL;
    console.log('🌐 API BASE URL:', this.baseURL);
  }

  /* ================= CAMPAIGNS ================= */

  async getCampaigns() {
    const res = await fetch(`${this.baseURL}/campaigns`);
    if (!res.ok) throw new Error('Error al obtener campañas');
    return res.json();
  }

  // Obtener campaña completa: con preguntas y opciones
  async getCampaignById(id) {
    // 1️⃣ Traer campaña
    const resCampaign = await fetch(`${this.baseURL}/campaigns/${id}`);
    if (!resCampaign.ok) throw new Error('Error al obtener campaña');
    const campaign = await resCampaign.json();

    // 2️⃣ Traer preguntas de la campaña
    const resQuestions = await fetch(`${this.baseURL}/questions/campaign/${id}`);
    if (!resQuestions.ok) throw new Error('Error al obtener preguntas');
    const questions = await resQuestions.json();

    // 3️⃣ Traer opciones para cada pregunta
    for (const q of questions) {

      if (!q.id) continue;

      const resOptions = await fetch(`${this.baseURL}/question-options/${q.id}`);
      if (!resOptions.ok) throw new Error('Error al obtener opciones');
      q.options = await resOptions.json();
    }

    return campaign;
  }

  async createCampaign(campaign) {
    const payload = campaign.toJSON();
    console.log('📤 Payload enviado:', payload);

    const res = await fetch(`${this.baseURL}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async updateCampaign(id, payload) {
    const res = await fetch(`${this.baseURL}/campaigns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  /* ================= QUESTIONS ================= */

  async createQuestion(question) {
    const res = await fetch(`${this.baseURL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question)
    });

    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async deleteQuestion(id) {
    const res = await fetch(`${this.baseURL}/questions/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error(await res.text());
  }

  /* ================= QUESTION OPTIONS ================= */

  async createQuestionOption(option) {
    const res = await fetch(`${this.baseURL}/question-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(option)
    });

    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async updateQuestion(id, payload) {
    return fetch(`${this.baseURL}/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json());
  }
  
  async updateQuestionOption(id, payload) {
    return fetch(`${this.baseURL}/question-options/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json());
  }


  /* ================= RESPONSES ================= */

  async submitResponse(response) {
    const res = await fetch(`${this.baseURL}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
    });

    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  
  /*PRUEBA DE NUEVO ENDPOINT*/ 

  async saveCampaignFull(id, payload) {
    console.log("🔥 LLAMANDO FULL SAVE", payload);
    
    const res = await fetch(`${this.baseURL}/campaigns/${id}/full`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }


}

  


export const apiService = new APIService();
