import { createQuestionCard } from './questionCard.js';

export function createQuestionsArea(campaign, callbacks) {
  const area = document.createElement('div');
  area.innerHTML = '<h4>Preguntas</h4>';

  const questionsList = document.createElement('div');
  questionsList.className = 'questions-list';

  campaign.questions
    .filter(q => q.isActive !== false)
    .forEach(question => {
      const card = createQuestionCard(question, campaign, callbacks);
      questionsList.appendChild(card);
    });

  const addButton = document.createElement('div');
  addButton.style.marginTop = '10px';
  addButton.innerHTML = '<button class="btn btn-primary">+ Añadir pregunta</button>';

  addButton.querySelector('button').addEventListener('click', () => {
    callbacks.onAddQuestion(campaign.id);
  });

  area.appendChild(questionsList);
  area.appendChild(addButton);

  return area;
}
