// apiService.js
import { API_CONFIG } from '../config/constants.js';

class APIService {
  constructor() {
    this.baseURL = API_CONFIG.BACKEND_URL;
    console.log('🌐 API BASE URL:', this.baseURL);
  }

  async getCampaigns() {
    const response = await fetch(`${this.baseURL}/campaigns`);
    if (!response.ok) throw new Error('Error al obtener campañas');
    return response.json();
  }

  async getCampaignById(id) {
    const response = await fetch(`${this.baseURL}/campaigns/${id}`);
    if (!response.ok) throw new Error('Error al obtener campaña por id');
    return response.json();   // ✅ esto sí existe
  }



  async createCampaign(campaign) {
    const payload = campaign.toJSON();
    console.log('📤 Payload enviado:', payload);
    
    const res = await fetch(`${this.baseURL}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
  
    return res.json();
  }

  // apiService.js
  async createQuestionOption(option) {
    const res = await fetch(`${this.baseURL}/question-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(option)
    });

    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async createQuestion(question) {
    const res = await fetch(`${this.baseURL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question)
    });
  
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
  
    return res.json();
  }

  
  async deleteQuestion(id) {
    const res = await fetch(`${this.baseURL}/questions/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error(await res.text());
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

  async submitResponse(response) {
    const res = await fetch(`${this.baseURL}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    return res.json();
  }


}

export const apiService = new APIService();
