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

  async createCampaign(campaign) {
    const payload = {
      name: campaign.name,
      client_type: campaign.clientType,
      date_start: campaign.dateStart,
      date_end: campaign.dateEnd || null
    };

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

  async submitResponse(responseData) {
    const response = await fetch(`${this.baseURL}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responseData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    return response.json();
  }
}

export const apiService = new APIService();
