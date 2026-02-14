// Área de preguntas y creación de tarjetas
import { createQuestionCard } from './questionCard.js';

export function createQuestionsArea(campaign, callbacks) {
  const area = document.createElement('div');
  area.innerHTML = '<h4>Preguntas</h4>';

  const questionsList = document.createElement('div');
  questionsList.className = 'questions-list';

  campaign.questions.filter(q => q.is_active !== false).forEach(q => {
    questionsList.appendChild(createQuestionCard(q, campaign, callbacks));
  });

  const addButton = document.createElement('div');
  addButton.style.marginTop = '10px';
  addButton.innerHTML = '<button id="addQuestionBtn" class="btn btn-primary">+ Añadir pregunta</button>';
  addButton.querySelector('#addQuestionBtn').addEventListener('click', () => callbacks.onAddQuestion(campaign.id));

  area.appendChild(questionsList);
  area.appendChild(addButton);

  return area;
}
