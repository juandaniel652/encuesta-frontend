// Selección de tipo de campaña
import { CLIENT_TYPES } from '../../config/constants.js';

export function renderClientTypeSelection(container, callbacks) {
  container.innerHTML = '';
  const element = document.createElement('div');
  element.style.maxWidth = '600px';
  element.style.margin = '40px auto';
  element.style.textAlign = 'center';

  element.innerHTML = `
    <h3>Nueva Campaña</h3>
    <p class="small" style="margin-bottom:30px">Seleccioná el tipo de campaña que querés crear:</p>
    <div style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap">
      <button id="btnWithClients" class="btn btn-primary" style="padding:20px 30px;font-size:16px">
        Con base de clientes
      </button>
      <button id="btnWithoutClients" class="btn btn-primary" style="padding:20px 30px;font-size:16px">
        Sin base de clientes
      </button>
    </div>
    <div style="margin-top:20px">
      <button id="btnCancelType" class="btn btn-ghost">Cancelar</button>
    </div>
  `;

  container.appendChild(element);

  document.getElementById('btnWithClients').addEventListener('click', 
    () => callbacks.onSelect(CLIENT_TYPES.WITH_CLIENTS));
  document.getElementById('btnWithoutClients').addEventListener('click', 
    () => callbacks.onSelect(CLIENT_TYPES.WITHOUT_CLIENTS));
  document.getElementById('btnCancelType').addEventListener('click', 
    () => callbacks.onCancel());
}
