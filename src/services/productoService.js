import { api } from "../api/client";

export const getProductos = async () => {
  return await api.get("/productos");
};

export const getProductoById = async (id) => {
  return await api.get(`/productos/${id}`);
};

export const createProducto = async (producto) => {
  return await api.post("/productos", producto);
};

export const updateProducto = async (id, producto) => {
  return await api.put(`/productos/${id}`, producto);
};

export const deleteProducto = async (id) => {
  return await api.delete(`/productos/${id}`);
};  