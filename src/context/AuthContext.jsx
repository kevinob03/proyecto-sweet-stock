import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sweetStockUser")); } catch { return null; }
  });

  const login = (usuario, token) => {
    setUsuario(usuario);
    localStorage.setItem("sweetStockUser", JSON.stringify(usuario));
    localStorage.setItem("sweetStockToken", token);
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem("sweetStockUser");
    localStorage.removeItem("sweetStockToken");
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
