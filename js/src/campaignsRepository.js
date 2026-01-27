import { apiService } from './services/apiService.js';
import { storageService } from './services/storageService.js';
import { STORAGE_KEYS } from './config/constants.js';

export async function loadCampaigns() {
  try {
    const campaigns = await apiService.getCampaigns();

    storageService.set(
      STORAGE_KEYS.CAMPAIGNS,
      campaigns
    );

    return campaigns;
  } catch (error) {
    console.warn('Backend no disponible, usando storage local');
    return storageService.get(STORAGE_KEYS.CAMPAIGNS) || [];
  }
}

export async function saveCampaign(campaign) {
  const saved = await apiService.createCampaign(campaign);
  return saved;
}
