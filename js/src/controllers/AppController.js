/**
 * Application Controller
 * Controlador principal que coordina toda la lógica de la aplicación
 */



import { apiService } from '../services/apiService.js';
import { Campaign } from '../models/Campaign.js';
import { Question } from '../models/Question.js';
import { CampaignListView } from '../views/CampaignListView.js';
import { CampaignEditorView } from '../views/CampaignEditorView.js';
import { CampaignRunnerView } from '../views/CampaignRunnerView.js';
import { ResponsesView } from '../views/ResponsesView.js';

export class AppController {
  constructor() {
    this.campaigns = [];
    this.selectedCampaignId = null;
    
    this.campaignListView = null;
    this.campaignEditorView = null;
    this.campaignRunnerView = null;
    this.responsesView = null;
  }

  /* ================= INIT ================= */

  async init() {
    await this.loadData();
    this.initializeViews();
    this.setupEventListeners();
    this.render();
  }

  /* ================= DATA ================= */

  async loadData() {
    const data = await apiService.getCampaigns();
    this.campaigns = data.map(c => Campaign.fromJSON(c));
  }

  getSelectedCampaign() {
    return this.campaigns.find(c => c.id === this.selectedCampaignId) || null;
  }

  /* ================= VIEWS ================= */

  initializeViews() {
    this.campaignListView = new CampaignListView(
      document.getElementById('campaignList'),
      this.handleCampaignSelect.bind(this)
    );
    
    this.campaignEditorView = new CampaignEditorView(
      document.getElementById('contentArea'),
      {
        onSave: this.handleCampaignSave.bind(this),
        onDelete: this.handleCampaignDelete.bind(this),
        onDuplicate: this.handleCampaignDuplicate.bind(this),
        onAddQuestion: this.handleAddQuestion.bind(this),
        onQuestionUpdate: this.handleQuestionUpdate.bind(this),
        onQuestionDelete: this.handleQuestionDelete.bind(this)
      }
    );

    this.campaignRunnerView = new CampaignRunnerView(
      document.getElementById('contentArea'),
      {
        onSubmit: this.handleResponseSubmit.bind(this),
        onCancel: this.handleRunCancel.bind(this)
      }
    );

    this.responsesView = new ResponsesView(
      document.getElementById('contentArea'),
      {
        onBack: this.handleResponsesBack.bind(this)
      }
    );
  }

  setupEventListeners() {
    document.getElementById('btnNewCampaign')
      .addEventListener('click', () => this.handleNewCampaign());

    document.getElementById('btnRunCampaign')
      .addEventListener('click', () => this.handleRunCampaign());

    document.getElementById('btnViewResponses')
      .addEventListener('click', () => this.handleViewResponses());

    document.getElementById('filterInput')
      .addEventListener('input', () => this.render());
  }

  /* ================= RENDER ================= */

  render() {
    const filterValue = document.getElementById('filterInput').value;
    this.campaignListView.render(
      this.campaigns,
      this.selectedCampaignId,
      filterValue
    );
    this.updateMainTitle();
    this.updateButtonStates();
  }

  updateMainTitle() {
    const campaign = this.getSelectedCampaign();
    document.getElementById('mainTitle').textContent =
      campaign ? campaign.name : 'Seleccioná o creá una campaña';
  }

  updateButtonStates() {
    const hasSelection = this.selectedCampaignId !== null;
    document.getElementById('btnRunCampaign').disabled = !hasSelection;
    document.getElementById('btnViewResponses').disabled = !hasSelection;
  }

  /* ================= HANDLERS ================= */

  handleCampaignSelect(campaignId) {
    this.selectedCampaignId = campaignId;
    const campaign = this.getSelectedCampaign();
    this.render();
    if (campaign) this.campaignEditorView.render(campaign);
  }

  // CREAR CAMPAÑA → BACKEND DIRECTO
  async handleNewCampaign() {
    this.campaignEditorView.renderClientTypeSelection(async (clientType) => {
      const newCampaign = new Campaign({
        name: 'Nueva campaña',
        clientType,
        dateStart: new Date().toISOString()
      });

      const created = await apiService.createCampaign(newCampaign.toJSON());
      const campaignInstance = Campaign.fromJSON(created);
      this.campaigns.push(campaignInstance);
          
      this.selectedCampaignId = campaignInstance.id;
      this.render();
      this.campaignEditorView.render(campaignInstance);
    });
  }

  // GUARDAR CAMPAÑA → BACKEND
  async handleCampaignSave(campaignId, updates) {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    campaign.update(updates);
    const payload = {
      id: campaign.id,
      name: campaign.name,
      client_type: campaign.clientType,
      date_start: campaign.dateStart,
      date_end: campaign.dateEnd
    };

    await apiService.createCampaign(payload);

    await this.loadData();
    this.render();
    alert('Campaña guardada en backend.');
  }

  // ELIMINAR (cuando implementes endpoint DELETE)
  async handleCampaignDelete(campaignId) {
    alert('Delete pendiente de implementar en backend.');
  }

  // DUPLICAR → CREA NUEVA EN BACKEND
  async handleCampaignDuplicate(campaignId) {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const duplicate = campaign.duplicate();
    const created = await apiService.createCampaign(duplicate.toJSON());
    await this.loadData();
    this.selectedCampaignId = created.id;
    this.render();
    this.campaignEditorView.render(Campaign.fromJSON(created));
  }

  // AGREGAR PREGUNTA (luego guardar)
  handleAddQuestion(campaignId) {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const newQuestion = new Question();
    campaign.addQuestion(newQuestion.toJSON());
    this.campaignEditorView.render(campaign);
  }

  handleQuestionUpdate() {
    // se guarda cuando tocan "Guardar campaña"
  }

  handleQuestionDelete(campaignId, questionId) {
    if (!confirm('¿Eliminar pregunta?')) return;

    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    campaign.removeQuestion(questionId);
    this.campaignEditorView.render(campaign);
  }

  // EJECUTAR
  handleRunCampaign() {
    const campaign = this.getSelectedCampaign();
    if (!campaign) return;
    this.campaignRunnerView.render(campaign);
  }

  // ENVIAR RESPUESTA → BACKEND
  async handleResponseSubmit(response) {
    await apiService.submitResponse(response);
    alert('Respuesta guardada en backend.');

    const campaign = this.getSelectedCampaign();
    if (campaign) this.campaignEditorView.render(campaign);
  }

  handleRunCancel() {
    const campaign = this.getSelectedCampaign();
    if (campaign) this.campaignEditorView.render(campaign);
  }

  // VER RESPUESTAS (cuando tengas endpoint GET /responses)
  async handleViewResponses() {
    alert('Vista de respuestas pendiente de endpoint backend.');
  }

  handleResponsesBack() {
    const campaign = this.getSelectedCampaign();
    if (campaign) this.campaignEditorView.render(campaign);
  }
}
