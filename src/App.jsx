import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import ChatBot from "./components/ChatBot";
import "./App.css";

function App() {
  return (
    <>
      <Navbar />
      <AppRoutes />
      <ChatBot />
    </>
  );
}

export default App;
