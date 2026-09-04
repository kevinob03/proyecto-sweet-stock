import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const USUARIO_STORAGE_KEY = "sweetStockUser";
const TOKEN_STORAGE_KEY = "sweetStockToken";

function leerUsuarioDeStorage() {
  const valor = localStorage.getItem(USUARIO_STORAGE_KEY);
  if (!valor) return null;
  try {
    return JSON.parse(valor);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerUsuarioDeStorage);

  const login = (usuario, token) => {
    setUsuario(usuario);
    localStorage.setItem(USUARIO_STORAGE_KEY, JSON.stringify(usuario));
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem(USUARIO_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}