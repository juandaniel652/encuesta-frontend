/**
 * Responses View
 * Vista para mostrar reportes de respuestas
 */

import { escapeHtml } from '../utils/helpers.js';

/**
 * Clase para renderizar reportes de respuestas
 */
export class ResponsesView {
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }

  /**
   * Renderiza la vista de reportes
   * @param {Campaign} campaign - Campaña
   * @param {Array} responses - Lista de respuestas
   */
  render(campaign, responses) {
    this.container.innerHTML = '';
    const area = document.createElement('div');

    area.innerHTML = `<h4>Reportes — ${escapeHtml(campaign.name)}</h4>`;

    const meta = document.createElement('div');
    meta.className = 'small';
    meta.textContent = `${responses.length} respuesta${responses.length !== 1 ? 's' : ''} registradas`;
    area.appendChild(meta);

    if (responses.length === 0) {
      this._renderEmptyState(area, campaign);
      this.container.appendChild(area);
      return;
    }

    // Renderizar estadísticas por pregunta
    campaign.questions.forEach((question, index) => {
      const questionBlock = this._createQuestionBlock(question, index, responses, campaign);
      area.appendChild(questionBlock);
    });

    // Botones de acciones
    const actionsDiv = this._createActionsButtons(campaign);
    area.appendChild(actionsDiv);

    this.container.appendChild(area);
  }

  /**
   * Renderiza estado vacío
   * @private
   */
  _renderEmptyState(container, campaign) {
    container.innerHTML += '<p class="small">No hay respuestas aún.</p>';
    
    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn-ghost';
    backBtn.textContent = 'Volver';
    backBtn.style.marginTop = '20px';
    backBtn.addEventListener('click', () => this.callbacks.onBack());
    
    container.appendChild(backBtn);
  }

  /**
   * Crea un bloque de estadísticas de pregunta
   * @private
   */
  _createQuestionBlock(question, index, responses, campaign) {
    const block = document.createElement('div');
    block.className = 'report-question-block';
    block.style.marginTop = '24px';
    block.style.padding = '16px';
    block.style.background = '#f8f9fa';
    block.style.borderRadius = '8px';

    // Título
    const title = document.createElement('div');
    title.style.fontWeight = '600';
    title.style.fontSize = '16px';
    title.style.marginBottom = '12px';
    title.textContent = `${index + 1}. ${question.text}`;
    block.appendChild(title);

    // Contar respuestas por opción
    const optionCounts = this._countResponsesByOption(question, responses);
    const totalResponses = responses.length;

    // Renderizar cada opción
    question.options.forEach(option => {
      const optionRow = this._createOptionRow(
        option,
        optionCounts[option.id],
        totalResponses
      );
      block.appendChild(optionRow.row);
      block.appendChild(optionRow.details);
    });

    return block;
  }

  /**
   * Cuenta las respuestas por cada opción
   * @private
   */
  _countResponsesByOption(question, responses) {
  const counts = {};

  question.options.forEach(option => {
    counts[option.id] = [];
  });

  responses.forEach(response => {
    const answer = response.answers.find(a => a.questionId === question.id);
    if (answer && answer.response && answer.response.length > 0) {
      const selectedOptionId = answer.response[0];
      if (counts[selectedOptionId]) {
        counts[selectedOptionId].push({
          clientName: response.clientName,
          clientNumber: response.clientNumber,
          date: response.createdAt
        });
      }
    }
  });

  return counts;
}

  /**
   * Crea una fila de opción con estadísticas
   * @private
   */
  _createOptionRow(option, clients, total) {
    const count = clients.length;
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;

    // Fila principal
    const row = document.createElement('div');
    row.className = 'report-option-row';
    row.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      margin-bottom: 6px;
      background: white;
      border-radius: 6px;
      cursor: ${count > 0 ? 'pointer' : 'default'};
      transition: all 0.2s;
    `;

    // Lado izquierdo (etiqueta + barra)
    const leftSide = this._createLeftSide(option, percentage);
    
    // Lado derecho (estadísticas)
    const rightSide = this._createRightSide(count, percentage);

    row.appendChild(leftSide);
    row.appendChild(rightSide);

    // Detalle expandible
    const details = this._createDetailsSection(option, clients, count);

    // Efectos hover y click
    if (count > 0) {
      this._addInteractionEffects(row, details);
    }

    return { row, details };
  }

  /**
   * Crea el lado izquierdo de la fila (label + barra)
   * @private
   */
  _createLeftSide(option, percentage) {
    const leftSide = document.createElement('div');
    leftSide.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    `;

    const label = document.createElement('span');
    label.textContent = option.text;

    label.style.fontWeight = '500';

    const barContainer = document.createElement('div');
    barContainer.style.cssText = `
      flex: 1;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      max-width: 200px;
    `;

    const barFill = document.createElement('div');
    barFill.style.cssText = `
      width: ${percentage}%;
      height: 100%;
      background: ${percentage > 0 ? '#2196F3' : '#e0e0e0'};
      transition: width 0.3s;
    `;

    barContainer.appendChild(barFill);
    leftSide.appendChild(label);
    leftSide.appendChild(barContainer);

    return leftSide;
  }

  /**
   * Crea el lado derecho de la fila (estadísticas)
   * @private
   */
  _createRightSide(count, percentage) {
    const rightSide = document.createElement('div');
    rightSide.style.cssText = `
      display: flex;
      gap: 16px;
      align-items: center;
    `;

    const countSpan = document.createElement('span');
    countSpan.style.cssText = `
      font-weight: 600;
      color: #666;
      min-width: 40px;
      text-align: right;
    `;
    countSpan.textContent = count.toString();

    const percentSpan = document.createElement('span');
    percentSpan.style.cssText = `
      font-weight: 600;
      color: #2196F3;
      min-width: 60px;
      text-align: right;
    `;
    percentSpan.textContent = `${percentage}%`;

    rightSide.appendChild(countSpan);
    rightSide.appendChild(percentSpan);

    return rightSide;
  }

  /**
   * Crea la sección de detalles expandible
   * @private
   */
  _createDetailsSection(option, clients, count) {
    const details = document.createElement('div');
    details.style.cssText = `
      display: none;
      margin-top: 8px;
      padding: 12px;
      background: #f0f7ff;
      border-radius: 6px;
      border-left: 3px solid #2196F3;
    `;

    if (count > 0) {
      const title = document.createElement('div');
      title.style.cssText = `
        font-weight: 600;
        margin-bottom: 8px;
        font-size: 13px;
      `;
      title.textContent = `Clientes que eligieron ""${option.text}":`;
      details.appendChild(title);

      clients.forEach(client => {
        const clientRow = this._createClientRow(client);
        details.appendChild(clientRow);
      });
    }

    return details;
  }

  /**
   * Crea una fila de cliente
   * @private
   */
  _createClientRow(client) {
    const row = document.createElement('div');
    row.style.cssText = `
      padding: 6px 8px;
      background: white;
      border-radius: 4px;
      margin-bottom: 4px;
      font-size: 13px;
    `;

    const dateStr = new Date(client.date).toLocaleDateString() + 
                   ' ' + new Date(client.date).toLocaleTimeString();

    row.innerHTML = `
      <div style="display:flex;justify-content:space-between">
        <span><strong>${escapeHtml(client.clientName)}</strong> (${escapeHtml(client.clientNumber)})</span>
        <span class="tiny" style="color:#666">${dateStr}</span>
      </div>
    `;

    return row;
  }

  /**
   * Añade efectos de interacción (hover y click)
   * @private
   */
  _addInteractionEffects(row, details) {
    row.addEventListener('mouseenter', () => {
      row.style.background = '#e3f2fd';
      row.style.transform = 'translateX(4px)';
    });

    row.addEventListener('mouseleave', () => {
      const isExpanded = details.style.display === 'block';
      row.style.background = isExpanded ? '#e3f2fd' : 'white';
      row.style.transform = 'translateX(0)';
    });

    row.addEventListener('click', () => {
      const isVisible = details.style.display === 'block';
      details.style.display = isVisible ? 'none' : 'block';
      row.style.background = isVisible ? 'white' : '#e3f2fd';
    });
  }

  /**
   * Crea los botones de acciones
   * @private
   */
  _createActionsButtons(campaign) {
    const actionsDiv = document.createElement('div');
    actionsDiv.style.cssText = `
      margin-top: 24px;
      display: flex;
      gap: 12px;
    `;

    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-primary';
    exportBtn.textContent = 'Exportar respuestas (JSON)';
    exportBtn.addEventListener('click', 
      () => this.callbacks.onExport(campaign.id));

    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn-ghost';
    backBtn.textContent = 'Volver';
    backBtn.addEventListener('click', 
      () => this.callbacks.onBack());

    actionsDiv.appendChild(exportBtn);
    actionsDiv.appendChild(backBtn);

    return actionsDiv;
  }
}