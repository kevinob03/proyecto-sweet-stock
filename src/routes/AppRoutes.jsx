import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import Home from "../pages/Home/Home";
import Dashboard from "../pages/Dashboard/Dashboard";
import Productos from "../pages/Productos/Productos";
import Pedidos from "../pages/Pedidos/Pedidos";
import AccesoDenegado from "../pages/AccesoDenegado/AccesoDenegado";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<Login />} />

      {/* Ruta para usuarios autenticados sin permisos */}
      <Route
        path="/acceso-denegado"
        element={<AccesoDenegado />}
      />

      {/* Rutas disponibles para ambos roles */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin", "user"]} />
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/pedidos" element={<Pedidos />} />
      </Route>

      {/* Ruta exclusiva del administrador */}
      <Route
        element={<ProtectedRoute allowedRoles={["admin"]} />}
      >
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Ruta inicial */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Ruta inexistente */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default AppRoutes;