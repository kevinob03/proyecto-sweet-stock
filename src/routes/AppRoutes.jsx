import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import Home from "../pages/Home/Home";
import Dashboard from "../pages/Dashboard/Dashboard";
import Productos from "../pages/Productos/Productos";
import Categorias from "../pages/Categorias/Categorias";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>

      {/* Ruta pública */}
      <Route path="/login" element={<Login />} />

      {/* Rutas para usuarios autenticados */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "user"]} />}>
        <Route path="/home" element={<Home />} />
        <Route path="/productos" element={<Productos />} />
      </Route>

      {/* Rutas exclusivas del administrador */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/categorias" element={<Categorias />} />
      </Route>

      {/* Ruta inicial */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rutas inexistentes */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default AppRoutes;