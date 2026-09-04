import { api } from "../api/client";

export const loginUser = async (email, password) => {
  const usuarios = await api.get(
    `/usuarios?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
  );

  return usuarios[0] || null;
};