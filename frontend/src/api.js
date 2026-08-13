const rawApiUrl = import.meta.env.VITE_API_URL || "https://smart-campus-project.onrender.com/api";
const cleanUrl = rawApiUrl.replace(/\/+$/, "");
const API_URL = cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;

async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const api = {
  register: (payload) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),

  login: (payload) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),

  createComplaint: (payload) =>
    request("/complaints", { method: "POST", body: JSON.stringify(payload) }),

  trackComplaint: (id) => request(`/complaints/${id}`),

  listComplaints: () => request("/complaints"),

  updateStatus: (id, status) =>
    request(`/complaints/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
