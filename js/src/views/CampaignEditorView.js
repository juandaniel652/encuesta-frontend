/**
 * Campaign Editor View
 * Vista para editar campañas
 */

import { escapeHtml } from '../utils/helpers.js';
import { CLIENT_TYPES } from '../config/constants.js';

/**
 * Clase para renderizar el editor de campañas
 */
export class CampaignEditorView {
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }

  /**
   * Renderiza el editor de campaña
   * @param {Campaign|null} campaign - Campaña a editar
   */
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

  /**
   * Renderiza la selección de tipo de campaña
   * @param {Function} onSelect - Callback cuando se selecciona un tipo
   */
  renderClientTypeSelection(onSelect) {
    this.container.innerHTML = '';
    const element = document.createElement('div');
    element.style.maxWidth = '600px';
    element.style.margin = '40px auto';
    element.style.textAlign = 'center';

    element.innerHTML = `
      <h3>Nueva Campaña</h3>
      <p class="small" style="margin-bottom:30px">Seleccioná el tipo de campaña que querés crear:</p>
      <div style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap">
        <button id="btnWithClients" class="btn btn-primary" style="padding:20px 30px;font-size:16px">
          Con base de clientes
        </button>
        <button id="btnWithoutClients" class="btn btn-primary" style="padding:20px 30px;font-size:16px">
          Sin base de clientes
        </button>
      </div>
      <div style="margin-top:20px">
        <button id="btnCancelType" class="btn btn-ghost">Cancelar</button>
      </div>
    `;

    this.container.appendChild(element);

    document.getElementById('btnWithClients').addEventListener('click', 
      () => onSelect(CLIENT_TYPES.WITH_CLIENTS));
    
    document.getElementById('btnWithoutClients').addEventListener('click', 
      () => onSelect(CLIENT_TYPES.WITHOUT_CLIENTS));
    
    document.getElementById('btnCancelType').addEventListener('click', 
      () => this._renderEmptyState());
  }

  /**
   * Renderiza estado vacío
   * @private
   */
  _renderEmptyState() {
    this.container.innerHTML = 
      '<p class="small">Seleccioná una campaña para ver o editar sus preguntas, o crea una nueva.</p>';
  }

  /**
   * Renderiza mensaje para campañas con clientes
   * @private
   */
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

    document.getElementById('deleteCampaignSimple').addEventListener('click', 
      () => this.callbacks.onDelete(campaign.id));
  }

  /**
   * Renderiza el editor completo
   * @private
   */
  _renderEditor(campaign) {
    this.container.innerHTML = '';
    const wrapper = document.createElement('div');

    const form = this._createCampaignForm(campaign);
    const questionsArea = this._createQuestionsArea(campaign);

    wrapper.appendChild(form);
    wrapper.appendChild(questionsArea);

    this.container.appendChild(wrapper);
  }

  /**
   * Crea el formulario de información de campaña
   * @private
   */
  _createCampaignForm(campaign) {
    const form = document.createElement('div');
    
    const startVal = campaign.dateStart ? 
      new Date(campaign.dateStart).toISOString().slice(0, 10) : '';
    const endVal = campaign.dateEnd ? 
      new Date(campaign.dateEnd).toISOString().slice(0, 10) : '';

    form.innerHTML = `
      <div class="row">
        <div class="col flex-1">
          <label>Nombre</label>
          <input type="text" id="campName" value="${escapeHtml(campaign.name)}" />
        </div>
        <div class="col col-date">
          <label>Fecha inicio</label>
          <input type="date" id="campStart" value="${startVal}" />
        </div>
        <div class="col col-date">
          <label>Fecha fin</label>
          <input type="date" id="campEnd" value="${endVal}" />
        </div>
      </div>
      <div class="row">
        <button id="saveCampaignBtn" class="btn btn-primary">Guardar/Modificar campaña</button>
        <button id="duplicateBtn" class="btn btn-ghost">Duplicar</button>
        <button id="deleteCampaignBtn" class="btn btn-ghost">Eliminar</button>
      </div>
    `;

    // Event listeners
    form.querySelector('#saveCampaignBtn').addEventListener('click', 
      () => this._handleSaveCampaign(campaign));
    
    form.querySelector('#duplicateBtn').addEventListener('click', 
      () => this.callbacks.onDuplicate(campaign.id));
    
    form.querySelector('#deleteCampaignBtn').addEventListener('click', 
      () => this.callbacks.onDelete(campaign.id));

    return form;
  }

  /**
   * Crea el área de preguntas
   * @private
   */
  _createQuestionsArea(campaign) {
    const area = document.createElement('div');
    area.innerHTML = '<h4>Preguntas</h4>';

    const questionsList = document.createElement('div');
    questionsList.className = 'questions-list';

    campaign.questions
    .filter(q => q.is_active !== false)
    .forEach(question => {
      const questionCard = this._createQuestionCard(question, campaign);
      questionsList.appendChild(questionCard);
    });


    const addButton = document.createElement('div');
    addButton.style.marginTop = '10px';
    addButton.innerHTML = '<button id="addQuestionBtn" class="btn btn-primary">+ Añadir pregunta</button>';
    
    addButton.querySelector('#addQuestionBtn').addEventListener('click', 
      () => this.callbacks.onAddQuestion(campaign.id));

    area.appendChild(questionsList);
    area.appendChild(addButton);

    return area;
  }

  /**
   * Crea una tarjeta de pregunta
   * @private
   */
  _createQuestionCard(question, campaign) {
    const card = document.createElement('div');
    card.className = 'question-card';

    const inner = document.createElement('div');
    inner.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <input type="text" class="q-text" value="${escapeHtml(question.text)}" 
               style="font-weight:600;border:0;background:transparent" />
        <div style="display:flex;gap:8px">
          <button class="btn btn-ghost btn-add-option">+ opt</button>
          <button class="btn btn-ghost btn-delete-q">Eliminar</button>
        </div>
      </div>
      <div class="options"></div>
    `;

    card.appendChild(inner);

    const optionsContainer = inner.querySelector('.options');
    this._renderQuestionOptions(question, campaign, optionsContainer);

    // Event listeners
    inner.querySelector('.q-text').addEventListener('change', (e) => {
      question.text = e.target.value;
      this.callbacks.onQuestionUpdate(question.id);
    });

    inner.querySelector('.btn-add-option').addEventListener('click', () => {
      this.callbacks.onOptionCreate(question.id, 'Nueva opción');
    });


    inner.querySelector('.btn-delete-q').addEventListener('click', () => {
      question.is_active = false;
      this.callbacks.onQuestionUpdate(question.id);
      this.render(campaign);
    });

    return card;
    }

  /**
   * Renderiza las opciones de una pregunta
   * @private
   */
  _renderQuestionOptions(question, campaign, container) {
    container.innerHTML = '';

    question.options
      .filter(o => o.is_active !== false)
      .forEach((option, index) => {

        if (!option.id) {
          throw new Error("Option sin ID. Estado corrupto.");
        }


        const row = document.createElement('div');
        row.className = 'option-item';

        row.innerHTML = `
          <input class="opt-text" type="text" value="${escapeHtml(option.text)}" />
          <button class="btn btn-ghost btn-del-opt">Eliminar</button>
        `;

        // eliminar opción
        row.querySelector('.btn-del-opt').addEventListener('click', () => {
          option.is_active = false;
          this.callbacks.onQuestionUpdate(question.id);
          this._renderQuestionOptions(question, campaign, container);
        });


        // editar opción
        row.querySelector('.opt-text').addEventListener('change', (e) => {
          this.callbacks.onOptionUpdate(question.id, option.id, e.target.value);
        });

        container.appendChild(row);
      });
  }

  /**
   * Maneja el guardado de campaña
   * @private
   */
  _handleSaveCampaign(campaign) {
    const name = document.getElementById('campName').value.trim();
    const start = document.getElementById('campStart').value;
    const end = document.getElementById('campEnd').value;
    const clientType = campaign.clientType;


    if (!name) {
      alert('El nombre es obligatorio.');
      return;
    }

    if (!clientType) {
      alert('El tipo de cliente es obligatorio.');
      return
    }

    const updates = {
      name,
      client_type: clientType,
      date_start: start ? new Date(start).toISOString() : null,
      date_end: end ? new Date(end).toISOString() : null
    };

    console.log("Payload real:", updates);
    this.callbacks.onSave(campaign.id, {
      campaign: updates,
      questions: campaign.questions
    });
  }
}