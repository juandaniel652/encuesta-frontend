/*Unica  fuente de verdad */

export class AppState {
  constructor() {
    this.campaigns = [];
    this.selectedCampaignId = null;
  }

  getSelectedCampaign() {
    return this.campaigns.find(c => c.id === this.selectedCampaignId) || null;
  }

  setCampaign(campaign) {
    const index = this.campaigns.findIndex(c => c.id === campaign.id);
    if (index !== -1) this.campaigns[index] = campaign;
    else this.campaigns.push(campaign);
  }
}
