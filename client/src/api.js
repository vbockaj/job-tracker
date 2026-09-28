const API = "http://localhost:3001/api/applications";

export async function getApplications() {
  const res = await fetch(API);
  return res.json();
}

export async function addApplication(data) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateApplication(id, data) {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteApplication(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
}