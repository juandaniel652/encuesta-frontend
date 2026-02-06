/**
 * Campaign Runner View
 * Vista para completar encuestas de campaña
 */

import { escapeHtml} from '../utils/helpers.js';
import { Response } from '../models/Response.js';
import { apiService } from '../services/apiService.js';

/**
 * Clase para renderizar el formulario de respuesta
 */
export class CampaignRunnerView {
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }

  /**
   * Renderiza el formulario de respuesta
   * @param {Campaign} campaign - Campaña a ejecutar
   */
  render(campaign) {
    this.container.innerHTML = '';
    const element = document.createElement('div');

    element.innerHTML = `
      <h4>Registrar respuesta — ${escapeHtml(campaign.name)}</h4>
      <form id="runForm">
        <div class="row">
          <div style="flex:1">
            <label>Nro de cliente</label>
            <input id="clientNumber" type="text" required />
          </div>
          <div style="width:260px">
            <label>Nombre</label>
            <input id="clientName" type="text" required />
          </div>
        </div>
        <div id="runQuestions"></div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button type="submit" class="btn btn-primary">Guardar respuesta</button>
          <button id="cancelRun" type="button" class="btn btn-ghost">Cancelar</button>
        </div>
      </form>
    `;

    this.container.appendChild(element);

    const questionsContainer = document.getElementById('runQuestions');
    this._renderQuestions(campaign, questionsContainer);

    document.getElementById('cancelRun').addEventListener('click', 
      () => this.callbacks.onCancel());

    document.getElementById('runForm').addEventListener('submit', 
      (e) => this._handleSubmit(e, campaign));
  }

  /**
   * Renderiza las preguntas del formulario
   * @private
   */
  _renderQuestions(campaign, container) {
    campaign.questions.forEach((question, index) => {
      const questionBlock = this._createQuestionBlock(question, index);
      container.appendChild(questionBlock);
    });
  }

  /**
   * Crea un bloque de pregunta
   * @private
   */
  _createQuestionBlock(question, index) {
    const block = document.createElement('div');
    block.style.marginTop = '10px';
    block.className = 'run-question-block';

    block.innerHTML = `
      <div style="font-weight:600">${index + 1}. ${escapeHtml(question.text)}</div>
    `;

    const optionsWrapper = document.createElement('div');
    optionsWrapper.className = 'options';

    question.options.forEach((option) => {
      const optionElement = this._createOptionElement(question, option);
      optionsWrapper.appendChild(optionElement);
    });

    block.appendChild(optionsWrapper);
    return block;
  }

  /**
   * Crea un elemento de opción de respuesta
   * @private
   */
  _createOptionElement(question, option) {
  const wrapper = document.createElement('label');
  wrapper.className = 'option-item';

  const input = document.createElement('input');
  input.type = 'radio';
  input.name = 'q_' + question.id;
  input.value = option.id;          // ← ID real

  const span = document.createElement('span');
  span.textContent = option.text;   // ← TEXTO real

  wrapper.appendChild(input);
  wrapper.appendChild(span);

  return wrapper;
}


  /**
   * Maneja el envío del formulario
   * @private
   */
  async _handleSubmit(event, campaign) {
    event.preventDefault();

    const clientNumber = document.getElementById('clientNumber').value.trim();
    const clientName = document.getElementById('clientName').value.trim();

    if (!clientNumber || !clientName) {
      alert('Completar número y nombre del cliente.');
      return;
    }

    // Validar que todas las preguntas tengan respuesta
    const isValid = this._validateAllQuestionsAnswered(campaign);
    if (!isValid) {
      alert('Falta seleccionar alguna respuesta.');
      return;
    }

    // Crear objeto de respuesta
    const response = this._createResponse(campaign, clientNumber, clientName);

    try {
      // Enviar al backend
      await apiService.submitResponse(response);
      alert('Respuesta registrada.');
      
      // Llamar callback de éxito
      this.callbacks.onSubmit(response);
    } catch (error) {
      console.error(error);
      alert('Error guardando en el backend: ' + error.message);
    }
  }

  /**
   * Valida que todas las preguntas tengan respuesta
   * @private
   */
  _validateAllQuestionsAnswered(campaign) {
    let allValid = true;

    // Limpiar marcas previas
    document.querySelectorAll('.run-question-block').forEach(block => {
      block.style.border = 'none';
      block.style.padding = '0';
    });

    campaign.questions.forEach(question => {
      const groupElements = document.getElementsByName('q_' + question.id);
      let hasAnswer = false;

      for (const element of groupElements) {
        if (element.checked) {
          hasAnswer = true;
          break;
        }
      }

      if (!hasAnswer) {
        allValid = false;
        const block = document.querySelector(
          `.run-question-block:has(input[name="q_${question.id}"])`
        );
        if (block) {
          block.style.border = '2px solid red';
          block.style.padding = '6px';
        }
      }
    });

    return allValid;
  }

  /**
   * Crea el objeto de respuesta
   * @private
   */
  _createResponse(campaign, clientNumber, clientName) {
    const response = new Response({
      campaignId: campaign.id,
      clientNumber,
      clientName
    });

    console.log("ID real:", campaign.id);
    console.log("IDs de preguntas:", campaign.questions.map(q => q.id));


    campaign.questions.forEach(question => {
      const elements = document.getElementsByName('q_' + question.id);
      const selectedValue = [];

      console.log("Preguntas:", campaign.questions);

      for (const element of elements) {
        if (element.checked) {
          selectedValue.push(element.value);
          break;
        }
      }

      response.addAnswer(question.id, selectedValue);

    });

    return response.toJSON();
  }
}