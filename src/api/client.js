const API_URL = "/api";

export const api = {
  getProductos: async () => {
    const res = await fetch(`${API_URL}/productos`);
    return res.json();
  },

  getProductoById: async (id) => {
    const res = await fetch(`${API_URL}/productos/${id}`);
    return res.json();
  },

  createProducto: async (producto) => {
    const res = await fetch(`${API_URL}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });
    return res.json();
  },

  updateProducto: async (id, producto) => {
    const res = await fetch(`${API_URL}/productos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });
    return res.json();
  },

  deleteProducto: async (id) => {
    await fetch(`${API_URL}/productos/${id}`, { method: "DELETE" });
  },

  getCategorias: async () => {
    const res = await fetch(`${API_URL}/categorias`);
    return res.json();
  },

  createCategoria: async (categoria) => {
    const res = await fetch(`${API_URL}/categorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoria),
    });
    return res.json();
  },

  deleteCategoria: async (id) => {
    await fetch(`${API_URL}/categorias/${id}`, { method: "DELETE" });
  },

  getUsuarios: async () => {
    const res = await fetch(`${API_URL}/usuarios`);
    return res.json();
  },

  login: async (email, password) => {
    const res = await fetch(
      `${API_URL}/usuarios?email=${email}&password=${password}`
    );
    const data = await res.json();
    return data[0] || null;
  },
};
