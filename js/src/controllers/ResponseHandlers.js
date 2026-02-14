// controllers/ResponseHandlers.js
/*Persistir respestas y volver a a la vista de edición*/

export function createResponseHandlers(controller) {
  return {
    async handleResponseSubmit(response) {
      await controller.api.submitResponse(response);
      alert('Respuesta guardada en backend.');

      const campaign = controller.state.getSelectedCampaign();
      if (campaign) controller.renderEditor(campaign);
    },

    async handleViewResponses() {
      const campaign = controller.state.getSelectedCampaign();
      if (!campaign) return;
        
      const stats = await controller.api.getResponsesByCampaign(campaign.id);
      controller.responsesView.render(stats, campaign);
    },


    handleResponsesBack() {
      const campaign = controller.state.getSelectedCampaign();
      if (campaign) controller.renderEditor(campaign);
    }
  };
}
