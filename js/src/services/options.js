// Funciones relacionadas a opciones de preguntas

export async function createQuestionOption(baseURL, option) {
  const res = await fetch(`${baseURL}/question-options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(option)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateQuestionOption(baseURL, id, payload) {
  const res = await fetch(`${baseURL}/question-options/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
