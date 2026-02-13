export function createQuestionHandlers(controller) {
  return {

    async handleQuestionUpdate(questionId, updates) {
      const campaign = controller.state.getSelectedCampaign();

      await controller.api.updateQuestion(questionId, updates);

      const freshCampaign = await controller.api.getCampaignById(campaign.id);

      controller.state.setCampaign(freshCampaign);
      controller.state.setSelectedCampaign(freshCampaign.id);

      controller.renderEditor(freshCampaign);
    },




    async handleAddQuestion(campaignId) {
      const campaign = controller.state.getSelectedCampaign();
        
      const created = await controller.api.createQuestion({
        campaign_id: campaignId,
        text: 'Nueva pregunta',
        type: 'text',
        position: campaign.questions.length + 1
      });
    
      const freshCampaign = await controller.api.getCampaignById(campaignId);
    
      controller.state.setCampaign(freshCampaign);
      controller.state.setSelectedCampaign(freshCampaign.id);
    
      controller.renderEditor(freshCampaign);
    },


    async handleAddOption(questionId) {
      const campaign = controller.state.getSelectedCampaign();

      // 1. Crear en backend
      await controller.api.createQuestionOption({
        question_id: questionId,
        text: 'Nueva opción'
      });
    
      // 2. Rehidratar estado real
      const freshCampaign = await controller.api.getCampaignById(campaign.id);
      controller.state.setSelectedCampaign(freshCampaign);
      controller.renderEditor(freshCampaign);
    }



  };
}