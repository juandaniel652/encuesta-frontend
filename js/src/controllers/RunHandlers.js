// controllers/RunHandlers.js
/*Ejecuta campaña y vuelve a editor*/

export function createRunHandlers(controller) {
  return {
    async handleRunCampaign() {
      const selected = controller.state.getSelectedCampaign();
      if (!selected) return;

      // Traer campaña real desde backend
      const raw = await controller.api.getCampaignById(selected.id);
      const campaign = controller.models.Campaign.fromJSON(raw);

      // Fuente de verdad
      controller.state.setCampaign(campaign);
      controller.state.selectedCampaignId = campaign.id;

      console.log("CAMPAÑA EJECUTABLE:", campaign);
      controller.campaignRunnerView.render(campaign);
    },

    handleRunCancel() {
      const campaign = controller.state.getSelectedCampaign();
      if (campaign) controller.renderEditor(campaign);
    }
  };
}
