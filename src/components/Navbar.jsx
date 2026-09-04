import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Sweet Stock
      </Link>
      <div className="navbar-links">
        <Link to="/">Inicio</Link>
        <Link to="/productos">Productos</Link>
        <Link to="/categorias">Categorías</Link>
      </div>
    </nav>
  );
}

export default Navbar;
