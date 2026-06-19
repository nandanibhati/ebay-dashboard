import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddOrder from "./pages/AddOrder";
import Orders from "./pages/Orders";
import Employees from "./pages/Employees";
import Analytics from "./pages/Analytics";
import AdminOrders from "./pages/AdminOrders";
import Signup from "./pages/Signup";
import Stock from "./pages/Stock";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Attendance from "./pages/Attendance";
import Leaves from "./pages/Leaves";
import Salary from "./pages/Salary";
import AdminAttendance from "./pages/AdminAttendance";
import AdminSalary from "./pages/AdminSalary";
import AdminLeaves from "./pages/AdminLeaves";
import AdminTasks from "./pages/AdminTasks";
import EmployeeTasks from "./pages/EmployeeTasks";

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

        <Route path="/stock" element={<Stock />} />

        <Route
  path="/tasks"
  element={<AdminTasks />}
/>

<Route
  path="/employee-tasks"
  element={<EmployeeTasks />}
/>
        <Route
  path="/admin-leaves"
  element={<AdminLeaves />}
/>

        <Route
  path="/employee-dashboard"
  element={<EmployeeDashboard />}
/>
<Route
  path="/admin-attendance"
  element={<AdminAttendance />}
/>

<Route
  path="/admin-salary"
  element={<AdminSalary />}
/>

<Route
  path="/attendance"
  element={<Attendance />}
/>

<Route
  path="/leaves"
  element={<Leaves />}
/>

<Route
  path="/salary"
  element={<Salary />}
/>

        <Route path="/admin-orders" element={<AdminOrders />} />

        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;