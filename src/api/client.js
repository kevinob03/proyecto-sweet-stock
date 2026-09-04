const API_URL = "/api";

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem("sweetStockToken");
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Error en la solicitud");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const api = {
  get: (endpoint) => request(endpoint),

  post: (endpoint, data) =>
    request(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }),

  put: (endpoint, data) =>
    request(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }),

  patch: (endpoint, data) =>
    request(endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }),

  delete: (endpoint) =>
    request(endpoint, {
      method: "DELETE",
    }),
};
