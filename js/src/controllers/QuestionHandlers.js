import { Question } from '../models/Question.js';
import { createQuestionCard } from '../views/editorView/questionCard.js';

export function createQuestionHandlers(controller) {
  return {
    async handleOptionUpdate(optionId, updates) {
      const campaign = controller.state.getSelectedCampaign();
      const question = campaign.questions.find(q => q.options.some(o => o.id === optionId));
      const option = question.options.find(o => o.id === optionId);
      option.text = updates.text;

      await controller.api.updateQuestionOption(optionId, updates);
    },

    async handleQuestionUpdate(questionId) {
      const campaign = controller.state.getSelectedCampaign();
      const question = campaign.questions.find(q => q.id === questionId);

      await controller.api.updateQuestion(questionId, {
        text: question.text,
        type: question.type,
        options: question.options
      });
    },

    async handleAddQuestion(campaignId) {
      const campaign = controller.state.getSelectedCampaign();
      const position = campaign.questions.length + 1; // ✅ ANTES del push

      const tempId = 'q_' + crypto.randomUUID();
      const tempQuestion = new Question({
        id: tempId,
        campaign_id: campaignId,
        text: 'Nueva pregunta',
        type: 'text',
        position: position,
        is_active: true,
        options: []
      });

      // ✅ Agregar a fuente de verdad
      campaign.questions.push(tempQuestion);

      // 🔹 Render solo la nueva tarjeta
      const questionsList = document.querySelector('.questions-list');
      if (questionsList) {
        const callbacks = controller.campaignEditorView.callbacks; // ✅ callbacks correctos
        const card = createQuestionCard(tempQuestion, campaign, callbacks);
        questionsList.appendChild(card);
      }

      // 🔹 Guardar en backend
      const created = await controller.api.createQuestion({
        campaign_id: campaignId,
        text: tempQuestion.text,
        type: tempQuestion.type,
        position: position // ✅ usar la variable, no recalcular
      });

      tempQuestion.id = created.id;
    },

    async handleDeleteQuestion(questionId) {
      const campaign = controller.state.getSelectedCampaign();

      // Backend
      await controller.api.deleteQuestion(questionId);

      // ✅ Actualizar fuente de verdad
      campaign.questions = campaign.questions.filter(q => q.id !== questionId);

      // DOM
      const card = document.querySelector(`.question-card[data-id='${questionId}']`);
      if (card) card.remove();
    },

    async handleOptionCreate(questionId, text) {
      const campaign = controller.state.getSelectedCampaign();

      const newOption = await controller.api.createQuestionOption({
        question_id: questionId,
        text
      });

      // actualizar modelo local
      const question = campaign.questions.find(q => q.id === questionId);
      question.options.push(newOption);

      controller.renderEditor(campaign);
    }
  };
}