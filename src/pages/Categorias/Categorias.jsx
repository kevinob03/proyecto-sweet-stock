import { useEffect, useState } from "react";
import { api } from "../../api/client";

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategorias().then((data) => {
      setCategorias(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Cargando categorías...</p>;

  return (
    <div>
      <h1>Categorías</h1>
      <ul>
        {categorias.map((cat) => (
          <li key={cat.id}>
            <strong>{cat.nombre}</strong> - {cat.descripcion}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Categorias;
