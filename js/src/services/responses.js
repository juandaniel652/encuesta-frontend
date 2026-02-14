//Funciones para enviar respuestas

export async function submitResponse(baseURL, response) {
  const res = await fetch(`${baseURL}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(response)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
