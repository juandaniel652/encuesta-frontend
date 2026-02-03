import { apiService } from './services/apiService.js';


export async function loadCampaigns() {
  const campaigns = await apiService.getCampaigns();
  return campaigns;
}


export async function saveCampaign(campaign) {
  const saved = await apiService.createCampaign(campaign);
  return saved;
}
