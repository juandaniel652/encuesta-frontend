/**
 * Responses View
 * Vista para mostrar reportes de respuestas
 */

import { escapeHtml } from '../utils/helpers.js';

export class ResponsesView {
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }

  render(stats, campaign) {
    this.container.innerHTML = '';
    const area = document.createElement('div');

    area.innerHTML = `<h4>Reportes — ${escapeHtml(campaign.name)}</h4>`;

    const total = stats.reduce((acc, row) => acc + row.total, 0);

    const meta = document.createElement('div');
    meta.className = 'small';
    meta.textContent = `${total} respuesta${total !== 1 ? 's' : ''} registradas`;
    area.appendChild(meta);

    if (stats.length === 0) {
      this._renderEmptyState(area, campaign);
      this.container.appendChild(area);
      return;
    }

    // Agrupar por pregunta
    let currentQuestion = null;
    let block;

    stats.forEach(row => {
      if (row.question_text !== currentQuestion) {
        currentQuestion = row.question_text;
        block = document.createElement('div');
        block.className = 'report-question-block';
        block.style.marginTop = '24px';
        block.style.padding = '16px';
        block.style.background = '#f8f9fa';
        block.style.borderRadius = '8px';

        const title = document.createElement('div');
        title.style.fontWeight = '600';
        title.style.fontSize = '16px';
        title.style.marginBottom = '12px';
        title.textContent = row.question_text;
        block.appendChild(title);

        area.appendChild(block);
      }

      const percentage = total > 0 ? ((row.total / total) * 100).toFixed(1) : 0;

      const optionRow = this._createOptionRow(
        row.option_text,
        row.total,
        percentage
      );

      block.appendChild(optionRow.row);
    });

    const actionsDiv = this._createActionsButtons(campaign);
    area.appendChild(actionsDiv);

    this.container.appendChild(area);
  }

  _renderEmptyState(container, campaign) {
    container.innerHTML += '<p class="small">No hay respuestas aún.</p>';
    
    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn-ghost';
    backBtn.textContent = 'Volver';
    backBtn.style.marginTop = '20px';
    backBtn.addEventListener('click', () => this.callbacks.onBack());
    
    container.appendChild(backBtn);
  }

  _createOptionRow(optionText, count, percentage) {
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
    `;

    const leftSide = this._createLeftSide(optionText, percentage);
    const rightSide = this._createRightSide(count, percentage);

    row.appendChild(leftSide);
    row.appendChild(rightSide);

    return { row };
  }

  _createLeftSide(optionText, percentage) {
    const leftSide = document.createElement('div');
    leftSide.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    `;

    const label = document.createElement('span');
    label.textContent = optionText;
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
