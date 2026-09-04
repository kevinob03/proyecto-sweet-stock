import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getProductos } from "../../services/productoService";
import { getPedidos } from "../../services/pedidoService";
import logo from "../../assets/sweetstock-logo.png";
import "./Home.css";

function Home() {
  const { usuario } = useAuth();

  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [productosData, pedidosData] = await Promise.all([
          getProductos(),
          getPedidos(),
        ]);

        setProductos(productosData);
        setPedidos(pedidosData);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // =========================
  // PEDIDOS SEGÚN EL ROL
  // =========================

  const pedidosUsuario =
    usuario?.rol === "admin"
      ? pedidos
      : pedidos.filter(
          (pedido) =>
            Number(pedido.usuarioId) === Number(usuario?.id)
        );

  const pedidosPendientes = pedidosUsuario.filter(
    (pedido) => pedido.estado === "pendiente"
  );

  const pedidosRecientes = [...pedidosUsuario]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 3);

  // =========================
  // INFORMACIÓN DEL INVENTARIO
  // =========================

  const stockDisponible = productos.reduce(
    (total, producto) =>
      total + Number(producto.stock),
    0
  );

  const productosStockBajo = productos.filter(
    (producto) =>
      Number(producto.stock) > 0 &&
      Number(producto.stock) <= 10
  );

  const productosSinStock = productos.filter(
    (producto) => Number(producto.stock) === 0
  );

  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return (
      <main className="home-page">
        <div className="home-container">
          <p className="home-status">
            Cargando información...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="home-page">
      <div className="home-container">

        {/* =========================
            ENCABEZADO
        ========================= */}

        <section className="home-header">
          <span className="home-label">
            {usuario?.rol === "admin"
              ? "ADMINISTRACIÓN"
              : "SWEET STOCK"}
          </span>

          <h1>
            Bienvenido/a, {usuario?.nombre}
          </h1>

          <p>
            {usuario?.rol === "admin"
              ? "Consulta rápidamente el estado general de SweetStock."
              : "Consulta tu actividad y mantente al tanto de tus pedidos."}
          </p>
        </section>


        {/* =========================
            HOME DEL ADMINISTRADOR
        ========================= */}

        {usuario?.rol === "admin" && (
          <>
            <section className="home-summary">

              <article className="home-summary-card">
                <span>
                  Productos registrados
                </span>

                <strong>
                  {productos.length}
                </strong>

                <p>
                  Productos disponibles en el sistema.
                </p>
              </article>


              <article className="home-summary-card">
                <span>
                  Pedidos registrados
                </span>

                <strong>
                  {pedidos.length}
                </strong>

                <p>
                  Pedidos registrados en SweetStock.
                </p>
              </article>


              <article className="home-summary-card">
                <span>
                  Pedidos pendientes
                </span>

                <strong>
                  {pedidosPendientes.length}
                </strong>

                <p>
                  Pedidos que requieren atención.
                </p>
              </article>

            </section>


            {/* ESTADO DEL INVENTARIO */}

            <section className="home-status-card">

              <div className="home-status-content">

                <span className="home-label">
                  ESTADO DEL INVENTARIO
                </span>

                <h2>
                  {productosSinStock.length > 0
                    ? `${productosSinStock.length} producto${
                        productosSinStock.length !== 1
                          ? "s"
                          : ""
                      } sin stock.`
                    : productosStockBajo.length > 0
                      ? `${productosStockBajo.length} producto${
                          productosStockBajo.length !== 1
                            ? "s"
                            : ""
                        } con stock bajo.`
                      : "El inventario está en buen estado."}
                </h2>

                <p>
                  {productosSinStock.length > 0
                    ? "Hay productos agotados que requieren reposición."
                    : productosStockBajo.length > 0
                      ? "Algunos productos se encuentran cerca del límite de stock."
                      : "No hay productos que requieran atención inmediata."}
                </p>

              </div>


              <div className="home-status-detail">

                <span>
                  Unidades disponibles
                </span>

                <strong>
                  {stockDisponible}
                </strong>

              </div>

            </section>


            {/* INFORMACIÓN DEL ADMIN */}

            <section className="home-lower-section">

              <article className="home-activity">

                <div className="home-section-header">

                  <span className="home-label">
                    PEDIDOS
                  </span>

                  <h2>
                    Actividad reciente
                  </h2>

                </div>

                {pedidosRecientes.length > 0 ? (

                  <div className="home-activity-list">

                    {pedidosRecientes.map((pedido) => (

                      <div
                        key={pedido.id}
                        className="home-activity-item"
                      >

                        <div>

                          <strong>
                            Pedido #{pedido.id}
                          </strong>

                          <span>
                            {pedido.fecha ||
                              "Fecha no disponible"}
                          </span>

                        </div>

                        <span className="home-order-status">
                          {pedido.estado}
                        </span>

                      </div>

                    ))}

                  </div>

                ) : (

                  <p className="home-empty">
                    Todavía no hay pedidos registrados.
                  </p>

                )}

              </article>


              <article className="home-brand-card">

                <img
                  src={logo}
                  alt="Sweet Stock"
                  className="home-brand-logo"
                />

                <div>

                  <span className="home-label">
                    ADMINISTRACIÓN
                  </span>

                  <h2>
                    Controla tu inventario.
                  </h2>

                  <p>
                    Utiliza el Dashboard para consultar
                    métricas y análisis detallados del inventario.
                  </p>

                </div>

              </article>

            </section>
          </>
        )}


        {/* =========================
            HOME DEL USUARIO
        ========================= */}

        {usuario?.rol === "user" && (
          <>
            <section className="home-summary">

              <article className="home-summary-card">
                <span>
                  Productos disponibles
                </span>

                <strong>
                  {productos.length}
                </strong>

                <p>
                  Productos disponibles para consultar.
                </p>
              </article>


              <article className="home-summary-card">
                <span>
                  Mis pedidos
                </span>

                <strong>
                  {pedidosUsuario.length}
                </strong>

                <p>
                  Pedidos realizados con tu cuenta.
                </p>
              </article>


              <article className="home-summary-card">
                <span>
                  Pedidos pendientes
                </span>

                <strong>
                  {pedidosPendientes.length}
                </strong>

                <p>
                  Pedidos que todavía están en proceso.
                </p>
              </article>

            </section>


            {/* ESTADO PERSONAL */}

            <section className="home-status-card">

              <div className="home-status-content">

                <span className="home-label">
                  MI ACTIVIDAD
                </span>

                <h2>
                  {pedidosPendientes.length > 0
                    ? `Tienes ${pedidosPendientes.length} pedido${
                        pedidosPendientes.length !== 1
                          ? "s"
                          : ""
                      } pendiente${
                        pedidosPendientes.length !== 1
                          ? "s"
                          : ""
                      }.`
                    : "No tienes pedidos pendientes."}
                </h2>

                <p>
                  {pedidosPendientes.length > 0
                    ? "Puedes consultar el estado de tus pedidos desde la sección Pedidos."
                    : "Cuando realices un pedido, podrás consultar su estado aquí."}
                </p>

              </div>


              <div className="home-status-detail">

                <span>
                  Mis pedidos
                </span>

                <strong>
                  {pedidosUsuario.length}
                </strong>

              </div>

            </section>


            {/* ACTIVIDAD DEL USUARIO */}

            <section className="home-lower-section">

              <article className="home-activity">

                <div className="home-section-header">

                  <span className="home-label">
                    MI ACTIVIDAD
                  </span>

                  <h2>
                    Mis pedidos recientes
                  </h2>

                </div>

                {pedidosRecientes.length > 0 ? (

                  <div className="home-activity-list">

                    {pedidosRecientes.map((pedido) => (

                      <div
                        key={pedido.id}
                        className="home-activity-item"
                      >

                        <div>

                          <strong>
                            Pedido #{pedido.id}
                          </strong>

                          <span>
                            {pedido.fecha ||
                              "Fecha no disponible"}
                          </span>

                        </div>

                        <span className="home-order-status">
                          {pedido.estado}
                        </span>

                      </div>

                    ))}

                  </div>

                ) : (

                  <p className="home-empty">
                    Todavía no has realizado ningún pedido.
                  </p>

                )}

              </article>


              <article className="home-brand-card">

                <img
                  src={logo}
                  alt="Sweet Stock"
                  className="home-brand-logo"
                />

                <div>

                  <span className="home-label">
                    SWEET STOCK
                  </span>

                  <h2>
                    Todo en un solo lugar.
                  </h2>

                  <p>
                    Consulta nuestros productos y
                    realiza tus pedidos de forma sencilla.
                  </p>

                </div>

              </article>

            </section>
          </>
        )}

      </div>
    </main>
  );
}

export default Home;