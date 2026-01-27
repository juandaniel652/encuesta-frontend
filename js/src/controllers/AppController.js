/**
 * Application Controller
 * Controlador principal que coordina toda la lógica de la aplicación
 */

import { storageService } from '../services/storageService.js';
import { Campaign } from '../models/Campaign.js';
import { Question } from '../models/Question.js';
import { CampaignListView } from '../views/CampaignListView.js';
import { CampaignEditorView } from '../views/CampaignEditorView.js';
import { CampaignRunnerView } from '../views/CampaignRunnerView.js';
import { ResponsesView } from '../views/ResponsesView.js';

/**
 * Controlador principal de la aplicación
 */
export class AppController {
  constructor() {
    this.campaigns = [];
    this.responses = [];
    this.selectedCampaignId = null;
    
    // Vistas
    this.campaignListView = null;
    this.campaignEditorView = null;
    this.campaignRunnerView = null;
    this.responsesView = null;
  }

  /**
   * Inicializa la aplicación
   */
  init() {
    this.loadData();
    this.initializeViews();
    this.setupEventListeners();
    this.initializeSampleData();
    this.render();
  }

  /**
   * Carga datos desde localStorage
   */
  loadData() {
    this.campaigns = storageService.readCampaigns().map(c => Campaign.fromJSON(c));
    this.responses = storageService.readResponses();
  }

  /**
   * Guarda campañas en localStorage
   */
  saveCampaigns() {
    storageService.writeCampaigns(this.campaigns.map(c => c.toJSON()));
  }

  /**
   * Guarda respuestas en localStorage
   */
  saveResponses() {
    storageService.writeResponses(this.responses);
  }

  /**
   * Inicializa las vistas
   */
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
        onBack: this.handleResponsesBack.bind(this),
        onExport: this.handleExportResponses.bind(this)
      }
    );
  }

  /**
   * Configura listeners de eventos globales
   */
  setupEventListeners() {
    document.getElementById('btnNewCampaign').addEventListener('click', 
      () => this.handleNewCampaign());
    
    document.getElementById('btnRunCampaign').addEventListener('click', 
      () => this.handleRunCampaign());
    
    document.getElementById('btnViewResponses').addEventListener('click', 
      () => this.handleViewResponses());
    
    document.getElementById('btnExport').addEventListener('click', 
      () => this.handleExport());
    
    document.getElementById('btnImport').addEventListener('click', 
      () => document.getElementById('importFile').click());
    
    document.getElementById('importFile').addEventListener('change', 
      (e) => this.handleImport(e));
    
    document.getElementById('filterInput').addEventListener('input', 
      (e) => this.handleFilter(e.target.value));
  }

  /**
   * Inicializa datos de ejemplo si no hay campañas
   */
  initializeSampleData() {
    if (this.campaigns.length === 0) {
      const sampleCampaign = new Campaign({
        name: 'Satisfacción instalación - AndrosNet',
        dateStart: new Date().toISOString(),
        clientType: 'without_clients'
      });
      
      const sampleQuestion = new Question({
        text: '¿Cómo calificarías el proceso de instalación de tu servicio?',
        options: ['Muy buena', 'Buena', 'Regular', 'Mala']
      });
      
      sampleCampaign.addQuestion(sampleQuestion.toJSON());
      this.campaigns.push(sampleCampaign);
      this.saveCampaigns();
    }
  }

  /**
   * Renderiza toda la interfaz
   */
  render() {
    const filterValue = document.getElementById('filterInput').value;
    this.campaignListView.render(this.campaigns, this.selectedCampaignId, filterValue);
    this.updateMainTitle();
    this.updateButtonStates();
  }

  /**
   * Actualiza el título principal
   */
  updateMainTitle() {
    const campaign = this.getSelectedCampaign();
    const title = campaign ? campaign.name : 'Seleccioná o creá una campaña';
    document.getElementById('mainTitle').textContent = title;
  }

  /**
   * Actualiza el estado de los botones
   */
  updateButtonStates() {
    const hasSelection = this.selectedCampaignId !== null;
    document.getElementById('btnRunCampaign').disabled = !hasSelection;
    document.getElementById('btnViewResponses').disabled = !hasSelection;
  }

  /**
   * Obtiene la campaña seleccionada
   * @returns {Campaign|null}
   */
  getSelectedCampaign() {
    return this.campaigns.find(c => c.id === this.selectedCampaignId) || null;
  }

  // ===== Event Handlers =====

  handleCampaignSelect(campaignId) {
    this.selectedCampaignId = campaignId;
    const campaign = this.getSelectedCampaign();
    this.render();
    if (campaign) {
      this.campaignEditorView.render(campaign);
    }
  }

  handleNewCampaign() {
    this.campaignEditorView.renderClientTypeSelection((clientType) => {
      const newCampaign = new Campaign({ clientType });
      this.campaigns.unshift(newCampaign);
      this.saveCampaigns();
      this.selectedCampaignId = newCampaign.id;
      this.render();
      this.campaignEditorView.render(newCampaign);
      
      if (clientType === 'with_clients') {
        alert('Campaña "Con base de clientes" creada. Esta opción estará disponible próximamente.');
      }
    });
  }

  handleCampaignSave(campaignId, updates) {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.update(updates);
      this.saveCampaigns();
      this.render();
      alert('Campaña guardada.');
    }
  }

  handleCampaignDelete(campaignId) {
    if (!confirm('¿Eliminar campaña y sus registros asociados?')) return;
    
    this.campaigns = this.campaigns.filter(c => c.id !== campaignId);
    this.responses = this.responses.filter(r => r.campaignId !== campaignId);
    
    this.saveCampaigns();
    this.saveResponses();
    
    this.selectedCampaignId = null;
    this.render();
    
    document.getElementById('contentArea').innerHTML = 
      '<p class="small">Campaña eliminada.</p>';
  }

  handleCampaignDuplicate(campaignId) {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (campaign) {
      const duplicate = campaign.duplicate();
      this.campaigns.unshift(duplicate);
      this.saveCampaigns();
      this.selectedCampaignId = duplicate.id;
      this.render();
      this.campaignEditorView.render(duplicate);
    }
  }

  handleAddQuestion(campaignId) {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (campaign) {
      const newQuestion = new Question();
      campaign.addQuestion(newQuestion.toJSON());
      this.saveCampaigns();
      this.campaignEditorView.render(campaign);
    }
  }

  handleQuestionUpdate(campaignId) {
    this.saveCampaigns();
  }

  handleQuestionDelete(campaignId, questionId) {
    if (!confirm('¿Eliminar pregunta?')) return;
    
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.removeQuestion(questionId);
      this.saveCampaigns();
      this.campaignEditorView.render(campaign);
    }
  }

  handleRunCampaign() {
    const campaign = this.getSelectedCampaign();
    if (!campaign) return;
    
    if (campaign.clientType === 'with_clients') {
      alert('Esta funcionalidad estará disponible próximamente.');
      return;
    }
    
    this.campaignRunnerView.render(campaign);
  }

  handleResponseSubmit(response) {
    this.responses.push(response);
    this.saveResponses();
    
    const campaign = this.getSelectedCampaign();
    if (campaign) {
      this.campaignEditorView.render(campaign);
    }
  }

  handleRunCancel() {
    const campaign = this.getSelectedCampaign();
    if (campaign) {
      this.campaignEditorView.render(campaign);
    }
  }

  handleViewResponses() {
    const campaign = this.getSelectedCampaign();
    if (!campaign) return;
    
    if (campaign.clientType === 'with_clients') {
      alert('Esta funcionalidad estará disponible próximamente.');
      return;
    }
    
    const campaignResponses = this.responses.filter(r => r.campaignId === campaign.id);
    this.responsesView.render(campaign, campaignResponses);
  }

  handleResponsesBack() {
    const campaign = this.getSelectedCampaign();
    if (campaign) {
      this.campaignEditorView.render(campaign);
    }
  }

  handleExportResponses(campaignId) {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    const campaignResponses = this.responses.filter(r => r.campaignId === campaignId);
    
    if (campaign) {
      const filename = campaign.name.replace(/[^a-z0-9]/gi, '_') + '_responses.json';
      this.exportJSON(campaignResponses, filename);
    }
  }

  handleExport() {
    const data = storageService.exportAll();
    const filename = 'androsnet_export_' + new Date().toISOString().slice(0, 10) + '.json';
    this.exportJSON(data, filename);
  }

  handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        storageService.importAll(data);
        this.loadData();
        this.render();
        alert('Importación completa.');
      } catch (error) {
        alert('Error leyendo archivo: ' + error.message);
      }
    };
    reader.readAsText(file);
  }

  handleFilter(filterValue) {
    this.render();
  }

  /**
   * Exporta datos como JSON
   */
  exportJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}