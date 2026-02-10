/*Edicion de preguntas y opciones*/

export function createQuestionHandlers(controller) {
  return {
    handleAddQuestion(campaignId) {
      const campaign = controller.state.getSelectedCampaign();
      campaign.addQuestion(new controller.models.Question());
      controller.renderEditor(campaign);
    },

    async handleQuestionDelete(campaignId, questionId) {
      await controller.api.deleteQuestion(questionId);
      const campaign = controller.state.getSelectedCampaign();
      campaign.removeQuestion(questionId);
      controller.renderEditor(campaign);
    }
  };
}
