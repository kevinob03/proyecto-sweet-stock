import { useEffect, useState } from "react";
import { api } from "../../api/client";
import "./Productos.css";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProductos().then((data) => {
      setProductos(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Cargando productos...</p>;

  return (
    <div>
      <h1>Productos</h1>
      <div className="productos-grid">
        {productos.map((producto) => (
          <div key={producto.id} className="producto-card">
            <h3>{producto.nombre}</h3>
            <p>{producto.descripcion}</p>
            <p className="precio">${producto.precio.toFixed(2)}</p>
            <p className="stock">Stock: {producto.stock}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Productos;
