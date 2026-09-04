import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/authService";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setCargando(true);

    try {
      const usuario = await loginUser(email, password);

      if (!usuario) {
        setError("Correo o contraseña incorrectos.");
        return;
      }

      login(usuario);

      if (usuario.rol === "admin") {
        navigate("/dashboard");
      } else if (usuario.rol === "user") {
        navigate("/home");
      }
    } catch (error) {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-header">
          <div className="login-logo">SS</div>

          <h1>Sweet Stock</h1>

          <p>Gestiona tu inventario de forma sencilla</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@sweetstock.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={cargando}
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="login-credentials">
          <h3>Credenciales de prueba</h3>

          <div className="credential">
            <strong>Administrador</strong>
            <span>admin@sweetstock.com</span>
            <span>Contraseña: admin123</span>
          </div>

          <div className="credential">
            <strong>Usuario</strong>
            <span>usuario1@sweetstock.com</span>
            <span>Contraseña: usuario123</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;