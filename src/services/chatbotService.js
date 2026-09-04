import { api } from "../api/client";

export const sendChatMessage = (message, history) => api.post("/chat", { message, history });
