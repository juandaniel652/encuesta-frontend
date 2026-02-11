export function createQuestionHandlers(controller) {
  return {

    async handleQuestionUpdate(questionId, updates) {
      const campaign = controller.state.getSelectedCampaign();
      const question = campaign.questions.find(q => q.id === questionId);

      question.update(updates);
      await controller.api.updateQuestion(question.id, updates);

      controller.renderEditor(campaign);
    },

    async handleOptionUpdate(optionId, updates) {
      const campaign = controller.state.getSelectedCampaign();

      const question = campaign.questions.find(q =>
        q.options.some(o => o.id === optionId)
      );

      const option = question.options.find(o => o.id === optionId);

      option.text = updates.text;

      await controller.api.updateQuestionOption(optionId, updates);

      controller.renderEditor(campaign);
    },

    async handleOptionCreate(questionId, text) {
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
