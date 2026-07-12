import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddOrder from "./pages/AddOrder";
import Orders from "./pages/Orders";
import Employees from "./pages/Employees";
import Analytics from "./pages/Analytics";
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
import Notes from "./pages/Notes";
import Templates from "./pages/Templates";
import EbayIntegration from "./pages/EbayIntegration";
import Purchases from "./pages/Purchases";
import Subscriptions from "./pages/Subscriptions";
import Chat from "./pages/Chat";
import FloatingChat from "./components/FloatingChat";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        <Route path="/manual-entry" element={<PrivateRoute><AddOrder /></PrivateRoute>} />

        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />

        <Route path="/employees" element={<PrivateRoute><Employees /></PrivateRoute>} />

        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />

        <Route path="/stock" element={<PrivateRoute><Stock /></PrivateRoute>} />
        <Route
  path="/chat"
  element={<PrivateRoute><Chat /></PrivateRoute>}
/>

<Route
  path="/subscriptions"
  element={
    <PrivateRoute>
      {localStorage.getItem("role") === "admin"
        ? <Subscriptions />
        : <Navigate to="/dashboard" />}
    </PrivateRoute>
  }
/>
        <Route
  path="/tasks"
  element={<PrivateRoute><AdminTasks /></PrivateRoute>}
/>

<Route
  path="/purchases"
  element={
    <PrivateRoute>
      {localStorage.getItem("role") === "admin"
        ? <Purchases />
        : <Navigate to="/dashboard" />}
    </PrivateRoute>
  }
/>
<Route
  path="/employee-tasks"
  element={<PrivateRoute><EmployeeTasks /></PrivateRoute>}
/>
        <Route
  path="/admin-leaves"
  element={<PrivateRoute><AdminLeaves /></PrivateRoute>}
/>

        <Route
  path="/employee-dashboard"
  element={<PrivateRoute><EmployeeDashboard /></PrivateRoute>}
/>
<Route
  path="/admin-attendance"
  element={<PrivateRoute><AdminAttendance /></PrivateRoute>}
/>

<Route
  path="/admin-salary"
  element={<PrivateRoute><AdminSalary /></PrivateRoute>}
/>

<Route
  path="/attendance"
  element={<PrivateRoute><Attendance /></PrivateRoute>}
/>

<Route
  path="/leaves"
  element={<PrivateRoute><Leaves /></PrivateRoute>}
/>

<Route
  path="/salary"
  element={<PrivateRoute><Salary /></PrivateRoute>}
/>
<Route
  path="/notes"
  element={<PrivateRoute><Notes /></PrivateRoute>}
/>
<Route
  path="/templates"
  element={<PrivateRoute><Templates /></PrivateRoute>}
/>
<Route
  path="/ebay-integration"
  element={<PrivateRoute><EbayIntegration /></PrivateRoute>}
/>

        <Route path="/signup" element={<Signup />} />
      </Routes>
      {isLoggedIn && <FloatingChat />}

    </BrowserRouter>
  );
}

export default App;