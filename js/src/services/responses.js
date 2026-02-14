// services/responses.js

// Enviar una respuesta
export async function submitResponse(baseURL, response) {
  const res = await fetch(`${baseURL}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(response)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Obtener respuestas por campaña (reportes)
export async function getResponsesByCampaign(baseURL, id) {
  const res = await fetch(`${baseURL}/responses/campaign/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
