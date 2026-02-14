// FUnciones relacionadas a campañas

import { API_CONFIG } from '../config/constants.js';

export async function getCampaigns(baseURL) {
  const res = await fetch(`${baseURL}/campaigns`);
  if (!res.ok) throw new Error('Error al obtener campañas');
  return res.json();
}

export async function getCampaignById(baseURL, id) {
  const resCampaign = await fetch(`${baseURL}/campaigns/${id}`);
  if (!resCampaign.ok) throw new Error('Error al obtener campaña');
  const campaign = await resCampaign.json();

  const resQuestions = await fetch(`${baseURL}/questions/campaign/${id}`);
  if (!resQuestions.ok) throw new Error('Error al obtener preguntas');
  const questions = await resQuestions.json();

  for (const q of questions) {
    if (!q.id) continue;
    const resOptions = await fetch(`${baseURL}/question-options/${q.id}`);
    if (!resOptions.ok) throw new Error('Error al obtener opciones');
    q.options = await resOptions.json();
  }

  return campaign;
}

export async function createCampaign(baseURL, payload) {
  const res = await fetch(`${baseURL}/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateCampaign(baseURL, id, payload) {
  const res = await fetch(`${baseURL}/campaigns/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveCampaignFull(baseURL, id, payload) {
  console.log("🔥 LLAMANDO FULL SAVE", payload);
  const res = await fetch(`${baseURL}/campaigns/${id}/full`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteCampaign(baseURL, id) {
  const res = await fetch(`${baseURL}/api/campaigns/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}
