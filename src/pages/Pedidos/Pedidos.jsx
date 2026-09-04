import "./Pedidos.css";

function Pedidos() {
  return (
    <main className="pedidos-page">
      <section className="pedidos-header">
        <span className="pedidos-label">
          SWEET STOCK
        </span>

        <h1>Pedidos</h1>

        <p>
          Consulta y gestiona los pedidos realizados.
        </p>
      </section>

      <section className="pedidos-empty">
        <h2>No hay pedidos todavía</h2>

        <p>
          Los pedidos realizados aparecerán aquí.
        </p>
      </section>
    </main>
  );
}

export default Pedidos;