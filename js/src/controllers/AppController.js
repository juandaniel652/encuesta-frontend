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
import { CLIENT_TYPES } from '../config/constants.js';

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

  async handleCampaignSelect(campaignId) {
    this.selectedCampaignId = campaignId;

    try {
      // 🔑 Traer campaña completa: con preguntas y opciones
      const raw = await apiService.getCampaignById(campaignId);
      const campaign = Campaign.fromJSON(raw);

      // 🔑 Actualizar el array local
      const index = this.campaigns.findIndex(c => c.id === campaign.id);
      if (index !== -1) {
        this.campaigns[index] = campaign;
      } else {
        this.campaigns.push(campaign);
      }

      this.render();

      // Render editor
      if (this.campaignEditorView) {
        this.campaignEditorView.render(campaign);
      }

    } catch (err) {
      console.error('Error cargando campaña completa:', err);
      alert('No se pudo cargar la campaña. Revisá la consola.');
    }
  }



  // CREAR CAMPAÑA → BACKEND DIRECTO
  handleNewCampaign() {
    const newCampaign = new Campaign({
      name: 'Campaña sin nombre',
      clientType: CLIENT_TYPES.WITHOUT_CLIENTS, // asegurar valor
      questions: []
    });

    apiService.createCampaign(newCampaign)
      .then(res => {
        console.log('Campaña creada:', res);
        // refrescar lista o UI
      })
      .catch(err => console.error(err));
  }


  // GUARDAR CAMPAÑA → BACKEND
  // AppController.js
  async handleCampaignSave(campaignId, updates) {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    campaign.update(updates);

    // 🔴 ESTO ES LO QUE FALTABA
    await apiService.saveCampaignFull(campaign.id, {
      campaign: {
        name: campaign.name,
        client_type: campaign.clientType,
        date_start: campaign.dateStart,
        date_end: campaign.dateEnd
      },
      questions: campaign.questions
    });
    
    for (let i = 0; i < campaign.questions.length; i++) {
      const q = campaign.questions[i];

      if (!q.id) {
        const savedQuestion = await apiService.createQuestion({
          campaign_id: campaign.id,
          text: q.text,
          type: q.type,
          position: i
        });
        q.id = savedQuestion.id;
      }

      for (const opt of q.options) {
        if (!opt.id) {
          const saved = await apiService.createQuestionOption({
            question_id: q.id,
            text: opt.text
          });
          opt.id = saved.id;
        }
      }
    }

    // Rehidratar desde backend
    const raw = await apiService.getCampaignById(campaign.id);
    const freshCampaign = Campaign.fromJSON(raw);

    const index = this.campaigns.findIndex(c => c.id === freshCampaign.id);
    this.campaigns[index] = freshCampaign;
    this.selectedCampaignId = freshCampaign.id;

    this.render();
    this.campaignEditorView.render(freshCampaign);
  }




  // ELIMINAR (cuando implementes endpoint DELETE)
  async handleCampaignDelete(campaignId) {
    alert('Delete pendiente de implementar en backend.');
  }

  // DUPLICAR → CREA NUEVA EN BACKEND
  async handleCampaignDuplicate(campaignId) {
    const original = this.campaigns.find(c => c.id === campaignId);
    if (!original) return;
    
    const duplicate = original.duplicate();
    
    // Crear en backend
    const created = await apiService.createCampaign(duplicate.toJSON());
    
    // Regla de oro
    await this.loadData();
    this.selectedCampaignId = created.id;
    
    const campaign = this.getSelectedCampaign();
    this.render();
    this.campaignEditorView.render(campaign);
  }


  // AGREGAR PREGUNTA (luego guardar)
  handleAddQuestion(campaignId) {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    // Forzar que sea instancia real
    if (!(campaign instanceof Campaign)) {
      console.error('NO ES INSTANCIA Campaign:', campaign);
      return;
    }
  
    const newQuestion = new Question();
    campaign.addQuestion(newQuestion);
    this.campaignEditorView.render(campaign);
  }

  handleQuestionUpdate() {
    // se guarda cuando tocan "Guardar campaña"
  }

  async handleQuestionDelete(campaignId, questionId) {
    if (!confirm('¿Eliminar pregunta?')) return;
    
    await apiService.deleteQuestion(questionId);
    
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    // 🔑 ESTO ES LO QUE TE FALTABA
    campaign.removeQuestion(questionId);
    
    this.campaignEditorView.render(campaign);
  }




  // EJECUTAR
  async handleRunCampaign() {
    const selected = this.getSelectedCampaign();
    if (!selected) return;

    // backend real
    const raw = await apiService.getCampaignById(selected.id);

    // normalizar a modelo
    const campaign = Campaign.fromJSON(raw);

    // 🔑 actualizar fuente de verdad
    const index = this.campaigns.findIndex(c => c.id === campaign.id);
    if (index !== -1) {
      this.campaigns[index] = campaign;
    }

    this.selectedCampaignId = campaign.id;

    console.log("CAMPAÑA REAL NORMALIZADA:", campaign);
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
