import { escapeHtml } from '../utils/helpers.js';
import { CLIENT_TYPES } from '../config/constants.js';
import { renderClientTypeSelection } from './editorView/clientTypeSelection.js';
import { createCampaignForm } from './editorView/campaignForm.js';
import { createQuestionsArea } from './editorView/questionsArea.js';

export class CampaignEditorView {
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }

  render(campaign) {
    if (!campaign) {
      this._renderEmptyState();
      return;
    }

    if (campaign.clientType === CLIENT_TYPES.WITH_CLIENTS) {
      this._renderWithClientsMessage(campaign);
      return;
    }

    this._renderEditor(campaign);
  }

  renderClientTypeSelection(onSelect) {
    renderClientTypeSelection(this.container, {
      onSelect,
      onCancel: () => this._renderEmptyState()
    });
  }

  _renderEmptyState() {
    this.container.innerHTML = '<p class="small">Seleccioná una campaña para ver o editar sus preguntas, o crea una nueva.</p>';
  }

  _renderWithClientsMessage(campaign) {
    this.container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.maxWidth = '600px';
    wrapper.style.margin = '40px auto';
    wrapper.style.textAlign = 'center';

    wrapper.innerHTML = `
      <h3>${escapeHtml(campaign.name)}</h3>
      <div style="padding:30px;background:#f0f0f0;border-radius:8px;margin:20px 0">
        <p style="font-size:18px;color:#666">Esta funcionalidad estará disponible próximamente.</p>
        <p class="small" style="margin-top:10px">Campaña configurada para trabajar con base de clientes.</p>
      </div>
      <button id="deleteCampaignSimple" class="btn btn-ghost">Eliminar campaña</button>
    `;

    this.container.appendChild(wrapper);
    document.getElementById('deleteCampaignSimple').addEventListener('click', () => this.callbacks.onDelete(campaign.id));
  }

  _renderEditor(campaign) {
    this.container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.appendChild(createCampaignForm(campaign, this.callbacks));
    wrapper.appendChild(createQuestionsArea(campaign, { ...this.callbacks, onRerenderQuestions: this._renderEditor.bind(this) }));
    this.container.appendChild(wrapper);
  }
}
