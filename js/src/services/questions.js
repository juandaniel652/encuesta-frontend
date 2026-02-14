// Funciones relacionadas a preguntas

export async function createQuestion(baseURL, question) {
  const res = await fetch(`${baseURL}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(question)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteQuestion(baseURL, id) {
  const res = await fetch(`${baseURL}/questions/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
}

export async function updateQuestion(baseURL, id, payload) {
  const res = await fetch(`${baseURL}/questions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
