import { Link } from "react-router-dom";
import "./AccesoDenegado.css";

function AccesoDenegado() {
  return (
    <main className="acceso-denegado-page">
      <section>
        <h1>Acceso denegado</h1>

        <p>
          No tienes permisos para acceder a esta sección.
        </p>

        <Link to="/home">
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}

export default AccesoDenegado;
