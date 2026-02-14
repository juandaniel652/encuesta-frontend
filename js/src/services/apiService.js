import { API_CONFIG } from '../config/constants.js';
import * as campaigns from './campaigns.js';
import * as questions from './questions.js';
import * as options from './options.js';
import * as responses from './responses.js';

class APIService {
  constructor() {
    this.baseURL = API_CONFIG.BACKEND_URL;
    console.log('🌐 API BASE URL:', this.baseURL);
  }

  // 🔹 Campaigns
  getCampaigns() { return campaigns.getCampaigns(this.baseURL); }
  getCampaignById(id) { return campaigns.getCampaignById(this.baseURL, id); }
  createCampaign(payload) { return campaigns.createCampaign(this.baseURL, payload); }
  updateCampaign(id, payload) { return campaigns.updateCampaign(this.baseURL, id, payload); }
  saveCampaignFull(id, payload) { return campaigns.saveCampaignFull(this.baseURL, id, payload); }

  // 🔹 Questions
  createQuestion(question) { return questions.createQuestion(this.baseURL, question); }
  deleteQuestion(id) { return questions.deleteQuestion(this.baseURL, id); }
  updateQuestion(id, payload) { return questions.updateQuestion(this.baseURL, id, payload); }

  // 🔹 Options
  createQuestionOption(option) { return options.createQuestionOption(this.baseURL, option); }
  updateQuestionOption(id, payload) { return options.updateQuestionOption(this.baseURL, id, payload); }

  // 🔹 Responses
  submitResponse(response) { return responses.submitResponse(this.baseURL, response); }
}

export const apiService = new APIService();
