import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getPedidosByUsuario } from "../../services/pedidoService";
import "./Pedidos.css";

function Pedidos() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPedidosByUsuario(usuario.id)
      .then((data) => {
        setPedidos(data);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudieron cargar los pedidos. Inténtalo de nuevo.");
        setLoading(false);
      });
  }, [usuario.id]);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return <p className="pedidos-mensaje">Cargando pedidos...</p>;
  }

  if (error) {
    return <p className="pedidos-mensaje pedidos-error">{error}</p>;
  }

  return (
    <main className="pedidos-page">
      <div className="pedidos-container">
        <div className="pedidos-header">
          <span className="pedidos-label">MIS PEDIDOS</span>

          <h1>Pedidos</h1>

          <p>Consulta los pedidos que has realizado.</p>
        </div>

        {pedidos.length === 0 ? (
          <div className="pedidos-empty">
            <h2>No hay pedidos todavía</h2>

            <p>Agrega un producto desde el catálogo para generar tu primer pedido.</p>
          </div>
        ) : (
          <div className="pedidos-lista">
            {pedidos.map((pedido) => (
              <article key={pedido.id} className="pedido-card">
                <div className="pedido-card-cabecera">
                  <span className="pedido-numero">Pedido #{pedido.id}</span>

                  <span className="pedido-fecha">{formatearFecha(pedido.fecha)}</span>

                  <span className={`pedido-estado ${pedido.estado}`}>
                    {pedido.estado}
                  </span>
                </div>

                <ul className="pedido-items">
                  {pedido.items.map((item) => (
                    <li key={item.productoId} className="pedido-item">
                      <span className="pedido-item-nombre">{item.nombre}</span>

                      <span className="pedido-item-detalle">
                        {item.cantidad} × ${item.precio.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="pedido-total">Total: ${pedido.total.toFixed(2)}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Pedidos;