import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Productos from "../pages/Productos/Productos";
import Categorias from "../pages/Categorias/Categorias";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/inicio" element={<Home />} />

      <Route path="/productos" element={<Productos />} />

      <Route path="/categorias" element={<Categorias />} />
    </Routes>
  );
}

export default AppRoutes;