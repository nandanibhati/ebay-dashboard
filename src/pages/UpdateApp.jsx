import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddOrder from "./pages/AddOrder";
import Orders from "./pages/Orders";
import Employees from "./pages/Employees";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/manual-entry" element={<AddOrder />} />

        <Route path="/orders" element={<Orders />} />

        <Route path="/employees" element={<Employees />} />

        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;