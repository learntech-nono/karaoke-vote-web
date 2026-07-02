const API_BASE = "https://karaokevote-api-ckecezakfje0gbgt.japanwest-01.azurewebsites.net/api";

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  return await res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return await res.json();
}

async function apiPut(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return await res.json();
}

async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE"
  });
  return await res.json();
}