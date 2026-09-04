import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";
import logo from "../assets/sweetstock-logo.png";

function Navbar() {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!usuario) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">

       <Link
          to={usuario.rol === "admin" ? "/dashboard" : "/home"}
          className="navbar-brand"
        >
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
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;