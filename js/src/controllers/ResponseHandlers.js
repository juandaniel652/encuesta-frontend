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
      alert('Vista de respuestas pendiente de endpoint backend.');
      // cuando exista:
      // const data = await controller.api.getResponsesByCampaign(id)
      // controller.responsesView.render(data)
    },

    handleResponsesBack() {
      const campaign = controller.state.getSelectedCampaign();
      if (campaign) controller.renderEditor(campaign);
    }
  };
}
