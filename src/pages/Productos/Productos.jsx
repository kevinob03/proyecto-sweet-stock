import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from "../../services/productoService";
import { getCategorias } from "../../services/categoriaService";
import { createPedido } from "../../services/pedidoService";
import "./Productos.css";

const camposVacios = {
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
  categoriaId: "",
};

function Productos() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [formData, setFormData] = useState(camposVacios);
  const [formError, setFormError] = useState("");

  const esAdmin = usuario?.rol === "admin";

  useEffect(() => {
    Promise.all([getProductos(), getCategorias()])
      .then(([productosData, categoriasData]) => {
        setProductos(productosData);
        setCategorias(categoriasData);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudieron cargar los productos. Inténtalo de nuevo.");
        setLoading(false);
      });
  }, []);

  const recargarProductos = () => {
    return getProductos().then(setProductos);
  };

  const mapaCategorias = categorias.reduce((mapa, categoria) => {
    mapa[categoria.id] = categoria.nombre;
    return mapa;
  }, {});

  const obtenerEstadoStock = (stock) => {
    if (stock === 0) return "Sin stock";
    if (stock <= 10) return "Stock bajo";
    return "Disponible";
  };

  const obtenerClaseStock = (stock) => {
    if (stock === 0) return "badge-sin-stock";
    if (stock <= 10) return "badge-stock-bajo";
    return "badge-disponible";
  };

  const abrirNuevoProducto = () => {
    setProductoEditando(null);
    setFormData(camposVacios);
    setFormError("");
    setFormularioAbierto(true);
  };

  const abrirEdicionProducto = (producto) => {
    setProductoEditando(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      categoriaId: producto.categoriaId,
    });
    setFormError("");
    setFormularioAbierto(true);
  };

  const cerrarFormulario = () => {
    setFormularioAbierto(false);
    setProductoEditando(null);
    setFormData(camposVacios);
    setFormError("");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((anterior) => ({ ...anterior, [name]: value }));
  };

  const guardarProducto = async (e) => {
    e.preventDefault();

    const datos = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: Number(formData.precio),
      stock: Number(formData.stock),
      categoriaId: Number(formData.categoriaId),
    };

    try {
      if (productoEditando) {
        await updateProducto(productoEditando.id, datos);
      } else {
        await createProducto(datos);
      }

      await recargarProductos();
      cerrarFormulario();
    } catch {
      setFormError("No se pudo guardar el producto. Inténtalo de nuevo.");
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;

    try {
      await deleteProducto(id);
      await recargarProductos();
    } catch {
      setError("No se pudo eliminar el producto. Inténtalo de nuevo.");
    }
  };

  const agregarAlPedido = async (producto) => {
    if (producto.stock === 0) return;

    try {
      await createPedido({
        usuarioId: usuario.id,
        fecha: new Date().toISOString(),
        estado: "pendiente",
        items: [
          {
            productoId: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1,
          },
        ],
        total: producto.precio,
      });

      navigate("/pedidos");
    } catch {
      setError("No se pudo crear el pedido. Inténtalo de nuevo.");
    }
  };

  if (loading) {
    return <p className="productos-mensaje">Cargando productos...</p>;
  }

  if (error) {
    return <p className="productos-mensaje productos-error">{error}</p>;
  }

  return (
    <main className="productos-page">
      <div className="productos-container">
      <div className="productos-header">
        <div className="productos-header-titles">
          <span className="productos-label">CATÁLOGO</span>

          <h1>Productos</h1>

          <p className="productos-descripcion">
            Consulta los productos disponibles en Sweet Stock.
          </p>
        </div>

        {esAdmin && !formularioAbierto && (
          <button
            type="button"
            className="btn btn-nuevo"
            onClick={abrirNuevoProducto}
          >
            Nuevo producto
          </button>
        )}
      </div>

      {esAdmin && formularioAbierto && (
        <form
          className="productos-form"
          onSubmit={guardarProducto}
        >
          <h2>
            {productoEditando ? "Editar producto" : "Nuevo producto"}
          </h2>

          <div className="form-group form-group-ancho-completo">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleFormChange}
              placeholder="Nombre del producto"
              required
            />
          </div>

          <div className="form-group form-group-ancho-completo">
            <label htmlFor="descripcion">Descripción</label>
            <input
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleFormChange}
              placeholder="Breve descripción"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="precio">Precio</label>
            <input
              id="precio"
              name="precio"
              type="number"
              min="0"
              step="0.01"
              value={formData.precio}
              onChange={handleFormChange}
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock</label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleFormChange}
              placeholder="0"
              required
            />
          </div>

          <div className="form-group form-group-ancho-completo">
            <label htmlFor="categoriaId">Categoría</label>
            <select
              id="categoriaId"
              name="categoriaId"
              value={formData.categoriaId}
              onChange={handleFormChange}
              required
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          {formError && (
            <p className="form-error">{formError}</p>
          )}

          <div className="form-acciones">
            <button type="submit" className="btn btn-guardar">
              Guardar
            </button>

            <button
              type="button"
              className="btn btn-cancelar"
              onClick={cerrarFormulario}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {productos.length === 0 ? (
        <p className="productos-mensaje">No hay productos disponibles.</p>
      ) : (
        <div className="productos-grid">
          {productos.map((producto) => (
            <div key={producto.id} className="producto-card">
              <h3>{producto.nombre}</h3>

              <p>{producto.descripcion}</p>

              <p className="categoria">
                {mapaCategorias[producto.categoriaId] ?? "Sin categoría"}
              </p>

              <p className="precio">
                ${producto.precio.toFixed(2)}
              </p>

              <p className="stock">
                Stock: {producto.stock}

                <span className={`badge ${obtenerClaseStock(producto.stock)}`}>
                  {obtenerEstadoStock(producto.stock)}
                </span>
              </p>

              <div className="card-acciones">
                {esAdmin ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-editar"
                      onClick={() => abrirEdicionProducto(producto)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="btn btn-eliminar"
                      onClick={() => eliminarProducto(producto.id)}
                    >
                      Eliminar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-agregar"
                    onClick={() => agregarAlPedido(producto)}
                    disabled={producto.stock === 0}
                  >
                    Agregar a pedido
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </main>
  );
}

export default Productos;