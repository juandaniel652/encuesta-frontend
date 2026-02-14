/**
 * Crea una tarjeta de pregunta
 * @param {Object} question - La pregunta
 * @param {Object} campaign - La campaña
 * @param {Object} callbacks - Callbacks para actualizar preguntas/opciones
 * @returns {HTMLElement} card
 */
export function createQuestionCard(question, campaign, callbacks) {
  const card = document.createElement('div');
  card.className = 'question-card';
  card.dataset.id = question.id;

  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <input type="text" class="q-text" value="${question.text}" 
             style="font-weight:600;border:0;background:transparent" />
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost btn-add-option">+ opt</button>
        <button class="btn btn-ghost btn-delete-q">Eliminar</button>
      </div>
    </div>
    <div class="options"></div>
  `;

  const optionsContainer = card.querySelector('.options');

  question.options
    .filter(o => o.isActive !== false)
    .forEach(option => {
      const row = document.createElement('div');
      row.className = 'option-item';
      row.dataset.optionId = option.id;
      row.innerHTML = `
        <input class="opt-text" type="text" value="${option.text}" />
        <button class="btn btn-ghost btn-del-opt">Eliminar</button>
      `;
      optionsContainer.appendChild(row);
    });

  // Event listeners
  card.querySelector('.q-text').addEventListener('change', (e) => {
    question.text = e.target.value;
    callbacks.onQuestionUpdate(question.id);
  });

  card.querySelector('.btn-add-option').addEventListener('click', () => {
    callbacks.onOptionCreate(question.id, 'Nueva opción');
  });

  card.querySelector('.btn-delete-q').addEventListener('click', async () => {
    question.isActive = false;
    await callbacks.onQuestionDelete(question.id);
    card.remove();
  });

  // Opciones
  optionsContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-del-opt')) {
      const row = e.target.closest('.option-item');
      const optionId = row.dataset.optionId;
      const option = question.options.find(o => o.id === optionId);
      if (!option) return;
      option.isActive = false;
      await callbacks.onOptionUpdate(option.id, { isActive: false });
      row.remove();
    }
  });

  optionsContainer.addEventListener('change', (e) => {
    if (e.target.classList.contains('opt-text')) {
      const row = e.target.closest('.option-item');
      const optionId = row.dataset.optionId;
      const option = question.options.find(o => o.id === optionId);
      if (!option) return;
      callbacks.onOptionUpdate(option.id, { text: e.target.value });
    }
  });

  return card;
}
