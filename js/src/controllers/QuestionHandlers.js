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
      const campaign = controller.state.getSelectedCampaign();
        
      // 1. Crear pregunta local con ID temporal
      const tempId = 'q_' + crypto.randomUUID();
        
      const tempQuestion = new Question({
        id: tempId,
        campaign_id: campaignId,
        text: 'Nueva pregunta',
        type: 'text',
        position: campaign.questions.length + 1,
        is_active: true,
        options: []
      });
  
      campaign.questions.push(tempQuestion);
      controller.renderEditor(campaign);
  
      // 2. Crear en backend
      const created = await controller.api.createQuestion({
        campaign_id: campaignId,
        text: tempQuestion.text,
        type: tempQuestion.type,
        position: tempQuestion.position
      });
  
      // 3. 🔥 SINCRONIZAR ID REAL
      const q = campaign.questions.find(q => q.id === tempId);
      if (q) {
        q.id = created.id;
      }
  
      controller.renderEditor(campaign);
    }


  };
}