/* Sector campañas */

export function createCampaignHandlers(controller) {
  return {
    async handleCampaignSelect(campaignId) {
      controller.state.selectedCampaignId = campaignId;

      const raw = await controller.api.getCampaignById(campaignId);
      const campaign = controller.models.Campaign.fromJSON(raw);

      controller.state.setCampaign(campaign);
      controller.renderEditor(campaign);
    },

    async handleCampaignSave(campaignId, updates) {
      const campaign = controller.state.getSelectedCampaign();
      campaign.update(updates);

      await controller.api.saveCampaignFull(campaign.id, {
        campaign: {
          name: campaign.name,
          client_type: campaign.clientType,
          date_start: campaign.dateStart,
          date_end: campaign.dateEnd
        },
        questions: campaign.questions
      });

      const raw = await controller.api.getCampaignById(campaign.id);
      const fresh = controller.models.Campaign.fromJSON(raw);
      controller.state.setCampaign(fresh);
      controller.renderEditor(fresh);
    }
  };
}
