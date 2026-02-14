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
        
      // 🔹 Mapear preguntas activas y sus opciones activas
      const payload = {
        campaign: {
          name: campaign.name,
          client_type: campaign.clientType,
          date_start: campaign.dateStart,
          date_end: campaign.dateEnd
        },
        questions: campaign.questions
          .filter(q => q.isActive !== false)        // solo preguntas activas
          .map(q => ({
            id: q.id || null,
            text: q.text,
            type: q.type,
            is_active: q.isActive,
            position: q.position,
            options: q.options
              ?.filter(o => o.isActive !== false)   // solo opciones activas
              .map(o => ({
                id: o.id || null,
                text: o.text,
                is_active: o.isActive
              })) || []
          }))
      };
    
      // 🔹 Convertir a JSON plano para evitar prototipos
      const payloadToSend = JSON.parse(JSON.stringify(payload));
    
      // 🔹 Llamada al endpoint modular
      await controller.api.saveCampaignFull(campaign.id, payloadToSend);
    
      // 🔹 Refrescar estado desde backend
      const raw = await controller.api.getCampaignById(campaign.id);
      const fresh = controller.models.Campaign.fromJSON(raw);
      controller.state.setSelectedCampaign(fresh);
      controller.renderEditor(fresh);
    }

  };
}
