// controllers/ResponseHandlers.js
/*Persistir respestas y volver a a la vista de edición*/

export function createResponseHandlers(controller) {
  return {
    async handleResponseSubmit(response) {
      try {
        await controller.api.submitResponse(response);  // ✅ único envío
        alert('Respuesta registrada.');
        const campaign = controller.state.getSelectedCampaign();
        if (campaign) controller.renderEditor(campaign);
      } catch (error) {
        alert('Error guardando en el backend: ' + error.message);
      }
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
