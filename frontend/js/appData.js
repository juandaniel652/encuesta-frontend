/* =========================================================
   appData.js — Gestión de datos y conexión con el servidor
   ========================================================= */
const Data = (() => {
  const API_BASE = 'http://localhost:3000/api';
  const KEY_CAMPAIGNS = 'andros_campaigns_v1';
  const KEY_RESPONSES = 'andros_responses_v1';

  /* ===== Local helpers ===== */
  const readLocal = key => JSON.parse(localStorage.getItem(key) || '[]');
  const writeLocal = (key, val) => localStorage.setItem(key, JSON.stringify(val));

  /* ===== API helpers ===== */
  async function apiGet(path) {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
    return res.json();
  }
  async function apiPost(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`POST ${path} -> ${res.status}`);
    return res.json();
  }
  async function apiDelete(path) {
    const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`DELETE ${path} -> ${res.status}`);
    return res.json();
  }

  /* ===== Funciones de uso público ===== */
  async function readCampaigns() {
    try {
      const list = await apiGet('/campaigns');
      writeLocal(KEY_CAMPAIGNS, list);
      return list;
    } catch {
      console.warn('⚠️ Offline: usando campañas locales');
      return readLocal(KEY_CAMPAIGNS);
    }
  }

  async function saveCampaign(camp) {
    try {
      await apiPost('/campaigns', camp);
      const list = await readCampaigns();
      writeLocal(KEY_CAMPAIGNS, list);
      return list;
    } catch {
      console.warn('⚠️ No se pudo guardar campaña, usando localStorage');
      const list = readLocal(KEY_CAMPAIGNS);
      list.push(camp);
      writeLocal(KEY_CAMPAIGNS, list);
      return list;
    }
  }

  async function readResponses() {
    try {
      const list = await apiGet('/responses');
      writeLocal(KEY_RESPONSES, list);
      return list;
    } catch {
      console.warn('⚠️ Offline: usando respuestas locales');
      return readLocal(KEY_RESPONSES);
    }
  }

  async function saveResponse(resp) {
    try {
      await apiPost('/responses', resp);
      const list = await readResponses();
      writeLocal(KEY_RESPONSES, list);
      return list;
    } catch {
      console.warn('⚠️ No se pudo guardar respuesta, usando local');
      const list = readLocal(KEY_RESPONSES);
      list.push(resp);
      writeLocal(KEY_RESPONSES, list);
      return list;
    }
  }

  async function deleteResponse(id) {
    try {
      await apiDelete(`/responses/${id}`);
    } catch {
      console.warn('⚠️ No se pudo eliminar del servidor, solo local.');
    }
    const list = readLocal(KEY_RESPONSES).filter(r => r.id !== id);
    writeLocal(KEY_RESPONSES, list);
    return list;
  }

  /* ===== Export ===== */
  return {
    readCampaigns,
    saveCampaign,
    readResponses,
    saveResponse,
    deleteResponse
  };
})();
