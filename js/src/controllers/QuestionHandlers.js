/* Edicion de preguntas y opciones */

export function createQuestionHandlers(controller) {
  return {

    async handleOptionCreate(questionId, text = 'Nueva opción') {
      const option = await controller.api.createQuestionOption({
        question_id: questionId,
        text,
        is_active: true
      });

      const campaign = controller.state.getSelectedCampaign();
      const question = campaign.questions.find(q => q.id === questionId);
      question.options.push(option);

      controller.renderEditor(campaign);
    }

  };
}
