import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Productos from "./pages/Productos";
import Categorias from "./pages/Categorias";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/categorias" element={<Categorias />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
