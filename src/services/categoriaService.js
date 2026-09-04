import { api } from "../api/client";

export const getCategorias = async () => {
  return await api.get("/categorias");
};

export const createCategoria = async (categoria) => {
  return await api.post("/categorias", categoria);
};

export const deleteCategoria = async (id) => {
  return await api.delete(`/categorias/${id}`);
};