import { api } from "../api/client";

export const loginUser = async (email, password) => {
  return api.post("/auth/login", { email, password });
};
