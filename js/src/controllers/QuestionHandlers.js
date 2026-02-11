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
