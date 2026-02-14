// Tarjeta individual de pregunta
import { escapeHtml } from '../../utils/helpers.js';

export function createQuestionCard(question, campaign, callbacks) {
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
  question.options.filter(o => o.is_active !== false).forEach(option => {
    const row = document.createElement('div');
    row.className = 'option-item';
    row.dataset.optionId = option.id;
    row.innerHTML = `
      <input class="opt-text" type="text" value="${escapeHtml(option.text)}" />
      <button class="btn btn-ghost btn-del-opt">Eliminar</button>
    `;
    optionsContainer.appendChild(row);
  });

  if (!optionsContainer.dataset.listenersAttached) {
    optionsContainer.addEventListener('click', async e => {
      if (e.target.classList.contains('btn-del-opt')) {
        const row = e.target.closest('.option-item');
        const optionId = row.dataset.optionId;
        const option = question.options.find(o => o.id === optionId);
        if (!option) return;
        option.is_active = false;
        await callbacks.onOptionUpdate(option.id, { is_active: false });
        row.remove();
      }
    });

    optionsContainer.addEventListener('change', e => {
      if (e.target.classList.contains('opt-text')) {
        const row = e.target.closest('.option-item');
        const optionId = row.dataset.optionId;
        const option = question.options.find(o => o.id === optionId);
        if (!option) return;
        callbacks.onOptionUpdate(option.id, { text: e.target.value });
      }
    });

    optionsContainer.dataset.listenersAttached = 'true';
  }

  inner.querySelector('.q-text').addEventListener('change', e => {
    question.text = e.target.value;
    callbacks.onQuestionUpdate(question.id);
  });

  inner.querySelector('.btn-add-option').addEventListener('click', () => callbacks.onOptionCreate(question.id, 'Nueva opción'));

  inner.querySelector('.btn-delete-q').addEventListener('click', async () => {
      question.isActive = false;
      await this.callbacks.onQuestionDelete(question.id);
    
      // 🔹 Opcional: eliminar del array para evitar confusión en UI
      const index = campaign.questions.findIndex(q => q.id === question.id);
      if (index > -1) campaign.questions.splice(index, 1);
    
      this._createQuestionsArea(campaign); // re-render
    });

  return card;
}
