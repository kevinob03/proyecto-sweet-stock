import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";
import logo from "../assets/sweetstock-logo.png";
import ConfirmModal from "./ConfirmModal";
import { useState } from "react";

function Navbar() {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setConfirmLogout(false);
    navigate("/login");
  };

  if (!usuario) {
    return null;
  }

  return (
    <><nav className="navbar">
      <div className="navbar-container">

        <Link to="/inicio" className="navbar-brand">
          <img
            src={logo}
            alt="Sweet Stock"
            className="navbar-logo"
          />

          <span className="navbar-name">
            Sweet Stock
          </span>
        </Link>

        <div className="navbar-links">

          {usuario.rol === "admin" && (
            <Link
              to="/dashboard"
              className={
                location.pathname === "/dashboard"
                  ? "active"
                  : ""
              }
            >
              Dashboard
            </Link>
          )}

          <Link
            to="/home"
            className={
              location.pathname === "/home"
                ? "active"
                : ""
            }
          >
            Inicio
          </Link>

          <Link
            to="/productos"
            className={
              location.pathname === "/productos"
                ? "active"
                : ""
            }
          >
            Productos
          </Link>

          <Link
            to="/pedidos"
            className={
              location.pathname === "/pedidos"
                ? "active"
                : ""
            }
          >
            Pedidos
          </Link>

        </div>

        <div className="navbar-user">
          <div className="navbar-user-info">
            <strong>{usuario.nombre}</strong>

            <span>
              {usuario.rol === "admin"
                ? "Administrador"
                : "Usuario"}
            </span>
          </div>

          <button
            type="button"
            className="navbar-logout"
            onClick={() => setConfirmLogout(true)}
          >
            Cerrar sesión
          </button>
        </div>

      </div>
    </nav><ConfirmModal open={confirmLogout} title="¿Deseas cerrar sesión?" message="Se limpiarán los datos de tu sesión y volverás al inicio de sesión." confirmText="Cerrar sesión" type="warning" onCancel={() => setConfirmLogout(false)} onConfirm={handleLogout}/></>
  );
}

export default Navbar;
