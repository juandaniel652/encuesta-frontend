// Creación del formulario de campaña
import { escapeHtml } from '../../utils/helpers.js';

export function createCampaignForm(campaign, callbacks = {}) {
  // 🔹 Desestructuración defensiva (BLINDA el componente)
  const {
    onSave = () => {},
    onDelete = () => {},
    onDuplicate = () => {}
  } = callbacks;

  const form = document.createElement('div');
  
  const startVal = campaign.dateStart 
    ? new Date(campaign.dateStart).toISOString().slice(0, 10) 
    : '';

  const endVal = campaign.dateEnd 
    ? new Date(campaign.dateEnd).toISOString().slice(0, 10) 
    : '';

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

  // 🔹 Ahora usamos las funciones seguras
  form.querySelector('#saveCampaignBtn').addEventListener('click', () => {
    const updates = {
      name: document.getElementById('campName').value.trim(),
      dateStart: document.getElementById('campStart').value || null,
      dateEnd: document.getElementById('campEnd').value || null
    };
  
    onSave(campaign.id, updates);
  });


  form.querySelector('#duplicateBtn')
    .addEventListener('click', () => onDuplicate(campaign.id));

  form.querySelector('#deleteCampaignBtn')
    .addEventListener('click', () => onDelete(campaign.id));

  return form;
}
