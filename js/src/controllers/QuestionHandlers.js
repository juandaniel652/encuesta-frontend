export function createQuestionHandlers(controller) {
  return {

    async handleOptionUpdate(optionId, updates) {
      const campaign = controller.state.getSelectedCampaign();
      
      console.log("OPTIONS:", campaign.questions.map(q => q.options));
      console.log("BUSCANDO:", optionId);

      const question = campaign.questions.find(q =>
        q.options.some(o => o.id === optionId)
      );
    
      if (!question) {
        console.error("Question not found for option:", optionId);
        return;
      }
    
      const option = question.options.find(o => o.id === optionId);
    
      if (!option) {
        console.error("Option not found:", optionId);
        return;
      }
    
      option.text = updates.text;
    
      await controller.api.updateQuestionOption(optionId, updates);
      const freshCampaign = await controller.api.getCampaignById(campaign.id);
      controller.state.setSelectedCampaign(freshCampaign);
      controller.renderEditor(freshCampaign);
    },



    async handleAddQuestion(campaignId) {
      const created = await controller.api.createQuestion({
        campaign_id: campaignId,
        text: 'Nueva pregunta',
        type: 'text',
        position: controller.state.getSelectedCampaign().questions.length + 1
      });
    
      const freshCampaign = await controller.api.getCampaignById(campaignId);
      controller.state.setSelectedCampaign(freshCampaign);
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