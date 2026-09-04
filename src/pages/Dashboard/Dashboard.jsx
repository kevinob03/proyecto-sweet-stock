import "./Dashboard.css";

function Dashboard() {
  return (
    <main className="dashboard-page">
      <section className="dashboard-header">
        <span className="dashboard-label">
          ADMINISTRACIÓN
        </span>

        <h1>Dashboard</h1>

        <p>
          Consulta y administra el estado de tu inventario.
        </p>
      </section>

      <section className="dashboard-cards">
        <article className="dashboard-card">
          <span>Total de productos</span>
          <strong>5</strong>
        </article>

        <article className="dashboard-card">
          <span>Stock disponible</span>
          <strong>140</strong>
        </article>

        <article className="dashboard-card">
          <span>Stock bajo</span>
          <strong>0</strong>
        </article>

        <article className="dashboard-card">
          <span>Sin stock</span>
          <strong>0</strong>
        </article>
      </section>
    </main>
  );
}

export default Dashboard;
