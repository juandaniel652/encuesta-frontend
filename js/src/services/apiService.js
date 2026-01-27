import { API_CONFIG } from '../config/constants.js';

class APIService {
  constructor() {
    this.baseURL = API_CONFIG.BACKEND_URL;
  }

  /* =========================
     CAMPAIGNS
  ========================== */

  async getCampaigns() {
    const response = await fetch(`${this.baseURL}/campaigns`);

    if (!response.ok) {
      throw new Error('Error al obtener campañas');
    }

    return response.json();
  }

  async createCampaign(campaignData) {
    const response = await fetch(`${this.baseURL}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    return response.json();
  }

  /* =========================
     RESPONSES (queda para luego)
  ========================== */

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

  handleError(error) {
    if (error.message.includes('Failed to fetch')) {
      return 'Error de conexión. Verifica tu conexión a internet.';
    }
    return error.message || 'Error desconocido';
  }
}

export const apiService = new APIService();
