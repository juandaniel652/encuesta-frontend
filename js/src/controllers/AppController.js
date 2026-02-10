/*Orquestador de la aplicación, maneja el estado global y 
delega tareas a los servicios y vistas*/

import { apiService } from '../services/apiService.js';
import { Campaign } from '../models/Campaign.js';
import { Question } from '../models/Question.js';
import { AppState } from './AppState.js';
import { CampaignListView } from '../views/CampaignListView.js';
import { CampaignEditorView } from '../views/CampaignEditorView.js';
import { CampaignRunnerView } from '../views/CampaignRunnerView.js';
import { ResponsesView } from '../views/ResponsesView.js';
import { CLIENT_TYPES } from '../config/constants.js';



export class AppController {
  constructor() {
    this.api = apiService;
    this.models = { Campaign, Question };
    this.state = new AppState();

    Object.assign(this,
      createCampaignHandlers(this),
      createQuestionHandlers(this),
      createRunHandlers(this),
      createResponseHandlers(this)
    );
  }

  async init() {
    const data = await this.api.getCampaigns();
    this.state.campaigns = data.map(c => Campaign.fromJSON(c));
    this.initializeViews();
    this.render();
  }

  renderEditor(campaign) {
    this.render();
    this.campaignEditorView.render(campaign);
  }
}
