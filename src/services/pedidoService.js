import { api } from "../api/client";

export const getPedidos = async () => {
  return await api.get("/pedidos");
};

export const getPedidoById = async (id) => {
  return await api.get(`/pedidos/${id}`);
};

export const getPedidosByUsuario = async (usuarioId) => {
  return await api.get(`/pedidos?usuarioId=${usuarioId}`);
};

export const createPedido = async (pedido) => {
  return await api.post("/pedidos", pedido);
};

export const updatePedido = async (id, pedido) => {
  return await api.patch(`/pedidos/${id}`, pedido);
};

export const deletePedido = async (id) => {
  return await api.delete(`/pedidos/${id}`);
};

export const getBusinessInfo = async () => api.get("/business-info");
