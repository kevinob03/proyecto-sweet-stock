import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const USUARIO_STORAGE_KEY = "usuario";

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

  const login = (usuario) => {
    setUsuario(usuario);
    localStorage.setItem(USUARIO_STORAGE_KEY, JSON.stringify(usuario));
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem(USUARIO_STORAGE_KEY);
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