// Creación del formulario de campaña
import { escapeHtml } from '../../utils/helpers.js';

export function createCampaignForm(campaign, callbacks) {
  const form = document.createElement('div');
  
  const startVal = campaign.dateStart ? new Date(campaign.dateStart).toISOString().slice(0, 10) : '';
  const endVal = campaign.dateEnd ? new Date(campaign.dateEnd).toISOString().slice(0, 10) : '';

  form.innerHTML = `
    <div class="row">
      <div class="col flex-1">
        <label>Nombre</label>
        <input type="text" id="campName" value="${escapeHtml(campaign.name)}" />
      </div>
      <div class="col col-date">
        <label>Fecha inicio</label>
        <input type="date" id="campStart" value="${startVal}" />
      </div>
      <div class="col col-date">
        <label>Fecha fin</label>
        <input type="date" id="campEnd" value="${endVal}" />
      </div>
    </div>
    <div class="row">
      <button id="saveCampaignBtn" class="btn btn-primary">Guardar/Modificar campaña</button>
      <button id="duplicateBtn" class="btn btn-ghost">Duplicar</button>
      <button id="deleteCampaignBtn" class="btn btn-ghost">Eliminar</button>
    </div>
  `;

  form.querySelector('#saveCampaignBtn').addEventListener('click', () => callbacks.onSave(campaign));
  form.querySelector('#duplicateBtn').addEventListener('click', () => callbacks.onDuplicate(campaign.id));
  form.querySelector('#deleteCampaignBtn').addEventListener('click', () => callbacks.onDelete(campaign.id));

  return form;
}
