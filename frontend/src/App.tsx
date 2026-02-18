import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import PrDashboard from "./pages/ProductiveDashboard.tsx";
import PrivateRoute from "./PrivateRoute.tsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Zabezpieczony dashboard */}
      <Route
        path="/productivedashboard"
        element={
          <PrivateRoute>
            <PrDashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
