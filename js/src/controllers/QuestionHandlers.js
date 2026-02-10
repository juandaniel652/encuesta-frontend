/*Edicion de preguntas y opciones*/

export function createQuestionHandlers(controller) {
  return {
    handleAddQuestion(campaignId) {
      const campaign = controller.state.getSelectedCampaign();
      campaign.addQuestion(new controller.models.Question());
      controller.renderEditor(campaign);
    },

    handleQuestionUpdate(campaignId) {
      // por ahora no hace nada
      // se guarda cuando tocan "Guardar campaña"
      console.log("Question updated in campaign", campaignId);
    },

    async handleQuestionDelete(campaignId, questionId) {
      await controller.api.deleteQuestion(questionId);
      const campaign = controller.state.getSelectedCampaign();
      campaign.removeQuestion(questionId);
      controller.renderEditor(campaign);
    }
  };
}
