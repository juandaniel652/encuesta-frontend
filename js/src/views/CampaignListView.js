/**
 * Campaign List View
 * Vista para mostrar la lista de campañas
 */

import { escapeHtml, formatDateRange } from '../utils/helpers.js';

/**
 * Clase para renderizar la lista de campañas
 */
export class CampaignListView {
  constructor(container, onSelectCallback) {
    this.container = container;
    this.onSelectCallback = onSelectCallback;
  }

  /**
   * Renderiza la lista de campañas
   * @param {Array<Campaign>} campaigns - Lista de campañas
   * @param {string|null} selectedId - ID de la campaña seleccionada
   * @param {string} filter - Filtro de búsqueda
   */
  render(campaigns, selectedId, filter = '') {
    this.container.innerHTML = '';

    const filteredCampaigns = this._filterCampaigns(campaigns, filter);
    const sortedCampaigns = this._sortCampaigns(filteredCampaigns);

    if (sortedCampaigns.length === 0) {
      this._renderEmptyState();
      return;
    }

    sortedCampaigns.forEach(campaign => {
      const item = this._createCampaignItem(campaign, selectedId);
      this.container.appendChild(item);
    });
  }

  /**
   * Filtra campañas por nombre
   * @private
   */
  _filterCampaigns(campaigns, filter) {
    if (!filter) return campaigns;
    const lowerFilter = filter.toLowerCase();
    return campaigns.filter(c => 
      c.name.toLowerCase().includes(lowerFilter)
    );
  }

  /**
   * Ordena campañas por fecha de creación (más recientes primero)
   * @private
   */
  _sortCampaigns(campaigns) {
    return [...campaigns].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  /**
   * Renderiza estado vacío
   * @private
   */
  _renderEmptyState() {
    this.container.innerHTML = '<div class="tiny muted">No hay campañas.</div>';
  }

  /**
   * Crea un elemento de campaña
   * @private
   */
  _createCampaignItem(campaign, selectedId) {
    const item = document.createElement('div');
    item.className = 'campaign-item' + (campaign.id === selectedId ? ' active' : '');
    item.tabIndex = 0;

    const meta = this._createCampaignMeta(campaign);
    const description = this._createCampaignDescription(campaign);

    item.appendChild(meta);
    item.appendChild(description);

    // Event listeners
    item.addEventListener('click', () => this.onSelectCallback(campaign.id));
    item.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.onSelectCallback(campaign.id);
    });

    return item;
  }

  /**
   * Crea la sección de metadata de la campaña
   * @private
   */
  _createCampaignMeta(campaign) {
    const meta = document.createElement('div');
    meta.className = 'campaign-meta';

    const name = document.createElement('div');
    name.className = 'campaign-name';
    name.textContent = campaign.name;

    const dates = document.createElement('div');
    dates.className = 'campaign-dates';
    dates.textContent = formatDateRange(campaign.dateStart, campaign.dateEnd);

    meta.appendChild(name);
    meta.appendChild(dates);

    return meta;
  }

  /**
   * Crea la descripción de la campaña
   * @private
   */
  _createCampaignDescription(campaign) {
    const desc = document.createElement('div');
    desc.className = 'tiny';
    desc.textContent = `${campaign.questions.length} pregunta${campaign.questions.length !== 1 ? 's' : ''}`;
    return desc;
  }
}