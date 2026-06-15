
import Sidebar from "../components/Sidebar";

export default function Employees() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">
          Employees
        </h1>

        <div className="bg-white p-6 rounded-xl shadow">
          <p>No employees added yet.</p>
        </div>
      </div>
    </div>
  );
}
