import { useEffect, useState } from "react";
import { getProductos } from "../../services/productoService";
import { getCategorias } from "../../services/categoriaService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./Dashboard.css";

function Dashboard() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [productosData, categoriasData] = await Promise.all([
          getProductos(),
          getCategorias(),
        ]);

        setProductos(productosData);
        setCategorias(categoriasData);
      } catch (error) {
        setError(
          "No se pudo cargar la información del inventario."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // =========================
  // MÉTRICAS DEL INVENTARIO
  // =========================

  const totalProductos = productos.length;

  const stockDisponible = productos.reduce(
    (total, producto) => total + Number(producto.stock),
    0
  );

  const stockBajo = productos.filter(
    (producto) =>
      Number(producto.stock) > 0 &&
      Number(producto.stock) <= 10
  );

  const sinStock = productos.filter(
    (producto) => Number(producto.stock) === 0
  );

  const stockNormal = productos.filter(
    (producto) => Number(producto.stock) > 10
  );

  const valorInventario = productos.reduce(
    (total, producto) =>
      total +
      Number(producto.precio) * Number(producto.stock),
    0
  );

  // =========================
  // DATOS PARA GRÁFICO DE STOCK
  // =========================

  const stockPorProducto = productos.map((producto) => ({
    nombre: producto.nombre,
    stock: Number(producto.stock),
  }));

  // =========================
  // DATOS PARA GRÁFICO DE CATEGORÍAS
  // =========================

  const productosPorCategoria = categorias.map((categoria) => ({
    nombre: categoria.nombre,
    cantidad: productos.filter(
      (producto) =>
        Number(producto.categoriaId) === Number(categoria.id)
    ).length,
  }));

  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">
          <p className="dashboard-status">
            Cargando información del inventario...
          </p>
        </div>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">
          <p className="dashboard-error">
            {error}
          </p>
        </div>
      </main>
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">

        {/* ENCABEZADO */}

        <section className="dashboard-header">
          <span className="dashboard-label">
            ADMINISTRACIÓN
          </span>

          <h1>Dashboard</h1>

          <p>
            Consulta y administra el estado general
            de tu inventario.
          </p>
        </section>

        {/* TARJETAS PRINCIPALES */}

        <section className="dashboard-cards">

          <article className="dashboard-card">
            <span>Total de productos</span>

            <strong>
              {totalProductos}
            </strong>

            <p>
              Productos registrados
            </p>
          </article>

          <article className="dashboard-card">
            <span>Stock disponible</span>

            <strong>
              {stockDisponible}
            </strong>

            <p>
              Unidades en inventario
            </p>
          </article>

          <article className="dashboard-card">
            <span>Stock bajo</span>

            <strong>
              {stockBajo.length}
            </strong>

            <p>
              Productos que requieren atención
            </p>
          </article>

          <article className="dashboard-card">
            <span>Sin stock</span>

            <strong>
              {sinStock.length}
            </strong>

            <p>
              Productos agotados
            </p>
          </article>

        </section>

        {/* INFORMACIÓN ADICIONAL */}

        <section className="dashboard-summary">

          <article className="dashboard-info-card">
            <span>
              Productos con stock normal
            </span>

            <strong>
              {stockNormal.length}
            </strong>

            <p>
              Productos con más de 10 unidades
              disponibles.
            </p>
          </article>

          <article className="dashboard-info-card">
            <span>
              Valor del inventario
            </span>

            <strong>
              ${valorInventario.toFixed(2)}
            </strong>

            <p>
              Valor estimado según precio y
              stock actual.
            </p>
          </article>

        </section>

        {/* GRÁFICOS */}

        <section className="dashboard-details">

          {/* GRÁFICO DE STOCK */}

          <article className="dashboard-section">

            <div className="dashboard-section-header">

              <div>
                <span className="dashboard-label">
                  INVENTARIO
                </span>

                <h2>
                  Stock por producto
                </h2>
              </div>

              <p>
                {stockDisponible} unidades en total
              </p>

            </div>

            <div className="dashboard-chart">

              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <BarChart
                  data={stockPorProducto}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 50,
                  }}
                >

                  <XAxis
                    dataKey="nombre"
                    tick={{
                      fontSize: 11,
                    }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />

                  <YAxis
                    allowDecimals={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="stock"
                    name="Unidades"
                    fill="#c9795d"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />

                </BarChart>
              </ResponsiveContainer>

            </div>

          </article>

          {/* GRÁFICO DE CATEGORÍAS */}

          <article className="dashboard-section">

            <div className="dashboard-section-header">

              <div>
                <span className="dashboard-label">
                  CATEGORÍAS
                </span>

                <h2>
                  Productos por categoría
                </h2>
              </div>

            </div>

            <div className="dashboard-chart dashboard-pie-chart">

              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <PieChart>

                  <Pie
                    data={productosPorCategoria}
                    dataKey="cantidad"
                    nameKey="nombre"
                    cx="50%"
                    cy="45%"
                    outerRadius={95}
                    innerRadius={55}
                    paddingAngle={3}
                  >

                    {productosPorCategoria.map(
                      (categoria, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            [
                              "#c9795d",
                              "#e8a0a8",
                              "#78927a",
                              "#5a3e36",
                            ][index % 4]
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>
              </ResponsiveContainer>

            </div>

          </article>

        </section>

        {/* ALERTAS DE INVENTARIO */}

        <section className="dashboard-section dashboard-alerts">

          <div className="dashboard-section-header">

            <div>
              <span className="dashboard-label">
                ATENCIÓN
              </span>

              <h2>
                Productos que requieren atención
              </h2>
            </div>

            <p>
              {stockBajo.length} producto
              {stockBajo.length !== 1
                ? "s"
                : ""}
            </p>

          </div>

          {/* PRODUCTOS CON STOCK BAJO */}

          {stockBajo.length > 0 ? (

            <div className="alert-list">

              {stockBajo.map((producto) => (

                <div
                  key={producto.id}
                  className="alert-item"
                >

                  <div>
                    <strong>
                      {producto.nombre}
                    </strong>

                    <span>
                      {producto.descripcion}
                    </span>
                  </div>

                  <div className="alert-stock">

                    <strong>
                      {producto.stock}
                    </strong>

                    <span>
                      unidades
                    </span>

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <p className="empty-message">
              No hay productos con stock bajo.
            </p>

          )}

          {/* PRODUCTOS AGOTADOS */}

          {sinStock.length > 0 && (

            <div className="out-of-stock">

              <h3>
                Productos agotados
              </h3>

              {sinStock.map((producto) => (

                <div
                  key={producto.id}
                  className="alert-item"
                >
                  <div>
                    <strong>
                      {producto.nombre}
                    </strong>
                    
                    <span>
                        {producto.descripcion}
                      </span>
                  </div>
                  <span>
                    Sin unidades disponibles
                  </span>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>
    </main>
  );
}

export default Dashboard;
