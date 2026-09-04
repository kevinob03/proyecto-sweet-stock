import { api } from "../api/client";

export const loginUser = async (email, password) => {
  return await api.login(email, password);
};