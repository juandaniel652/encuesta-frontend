export function createCampaignHandlers(controller) {
  return {
    async handleCampaignSelect(campaignId) {
      controller.state.selectedCampaignId = campaignId;

      const raw = await controller.api.getCampaignById(campaignId);
      const campaign = controller.models.Campaign.fromJSON(raw);

      controller.state.setCampaign(campaign);
      controller.renderEditor(campaign);

      document.getElementById("btnRunCampaign").disabled = false;
      document.getElementById("btnViewResponses").disabled = false;
    },

    async handleCampaignSave(campaignId, updates) {
      const campaign = controller.state.getSelectedCampaign();
      campaign.update(updates);

      const payload = {
        campaign: {
          name: campaign.name,
          client_type: campaign.clientType,
          date_start: campaign.dateStart,
          date_end: campaign.dateEnd
        },
        questions: campaign.questions
          .filter(q => q.isActive !== false)
          .map(q => ({
            id: q.id || null,
            text: q.text,
            type: q.type,
            is_active: q.isActive,
            position: q.position,
            options: q.options
              ?.filter(o => o.isActive !== false)
              .map(o => ({
                id: o.id || null,
                text: o.text,
                is_active: o.isActive
              })) || []
          }))
      };

      const payloadToSend = JSON.parse(JSON.stringify(payload));

      await controller.api.saveCampaignFull(campaign.id, payloadToSend);

      const raw = await controller.api.getCampaignById(campaign.id);
      const fresh = controller.models.Campaign.fromJSON(raw);
      controller.state.setSelectedCampaign(fresh);
      controller.renderEditor(fresh);
    },

    // 🔥 ESTE NO EXISTÍA
    async handleCampaignDelete(campaignId) {
      console.log('BORRANDO CAMPAÑA:', campaignId);

      await controller.api.deleteCampaign(campaignId);

      // 🔹 eliminar del estado local
      controller.state.campaigns = controller.state.campaigns
        .filter(c => c.id !== campaignId);

      // 🔹 limpiar selección
      controller.state.selectedCampaignId = null;

      // 🔹 re-render global
      controller.render();
      controller.campaignEditorView.render(null);
    }

  };
}
