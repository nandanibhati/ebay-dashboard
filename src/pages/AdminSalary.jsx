import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  Wallet,
  Clock3,
  IndianRupee,
  Pencil,
  Users,
} from "lucide-react";

export default function AdminSalary() {
  const [employees, setEmployees] = useState([]);
  const [monthlyHours, setMonthlyHours] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [basicSalary, setBasicSalary] = useState("");

  const fetchEmployees = async () => {
    try {
      const res = await fetch(
        "https://ebay-dashboard-z7h2.onrender.com/api/auth/employees"
      );

      const data = await res.json();

      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const updateSalary = async () => {
    try {
      const res = await fetch(
        `https://ebay-dashboard-z7h2.onrender.com/api/auth/employee/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            basicSalary,
            monthlyHours,
          }),
        }
      );

      const data = await res.json();

      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === editingId
            ? {
                ...emp,
                basicSalary,
                monthlyHours,
              }
            : emp
        )
      );

      if (data.success) {
        alert("Salary Updated Successfully");

        setEditingId(null);
        setBasicSalary("");
        setMonthlyHours("");

        fetchEmployees();
      }
    } catch (error) {
      console.log(error);
      alert("Failed to Update Salary");
    }
  };

  const totalEmployees = employees.length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 ml-72 p-8 space-y-8">

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold">
            Salary Management 💰
          </h1>

          <p className="mt-2 text-violet-100">
            Manage employee salaries, working hours and payouts.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">
                  Employees
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {totalEmployees}
                </h2>
              </div>

              <div className="bg-violet-100 p-4 rounded-2xl">
                <Users className="text-violet-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">
                  Salary Module
                </p>

                <h2 className="text-2xl font-bold mt-2">
                  Active
                </h2>
              </div>

              <div className="bg-green-100 p-4 rounded-2xl">
                <Wallet className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">
                  Payroll Status
                </p>

                <h2 className="text-2xl font-bold mt-2 text-green-600">
                  Ready
                </h2>
              </div>

              <div className="bg-blue-100 p-4 rounded-2xl">
                <IndianRupee className="text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Edit Card */}
        {editingId && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-6">
              Update Salary
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Monthly Salary"
                value={basicSalary}
                onChange={(e) =>
                  setBasicSalary(e.target.value)
                }
                className="border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-violet-200 outline-none"
              />

              <input
                type="number"
                placeholder="Monthly Hours"
                value={monthlyHours}
                onChange={(e) =>
                  setMonthlyHours(e.target.value)
                }
                className="border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-violet-200 outline-none"
              />
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={updateSalary}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-2xl hover:opacity-90"
              >
                Update Salary
              </button>

              <button
                onClick={() => {
                  setEditingId(null);
                  setBasicSalary("");
                  setMonthlyHours("");
                }}
                className="bg-red-500 text-white px-6 py-3 rounded-2xl hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">
              Employee Payroll
            </h2>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50">
                <tr className="text-gray-600">
                  <th className="p-5 text-left">
                    Employee
                  </th>

                  <th className="text-left">
                    Email
                  </th>

                  <th className="text-left">
                    Monthly Salary
                  </th>

                  <th className="text-left">
                    Hours
                  </th>

                  <th className="text-left">
                    Total Salary
                  </th>

                  <th className="text-left">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {employees.map((emp) => {
                  const hours = Number(
                    emp.monthlyHours || 0
                  );

                  const hourlyRate =
                    Number(emp.basicSalary || 0) /
                    (8 * 6 * 4.33);

                  const salary =
                    hours * hourlyRate;

                  return (
                    <tr
                      key={emp._id}
                      className="border-b hover:bg-violet-50 transition-all"
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white flex items-center justify-center font-bold">
                            {emp.name?.charAt(0)}
                          </div>

                          <div>
                            <p className="font-semibold">
                              {emp.name}
                            </p>

                            <p className="text-xs text-green-500">
                              ● Active
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>{emp.email}</td>

                      <td className="font-medium">
                        ₹{emp.basicSalary || 0}
                      </td>

                      <td>
                        <div className="flex items-center gap-2">
                          <Clock3
                            size={16}
                            className="text-gray-400"
                          />
                          {hours.toFixed(2)}
                        </div>
                      </td>

                      <td className="font-bold text-green-600">
                        ₹{salary.toFixed(2)}
                      </td>

                      <td>
                        <button
                          onClick={() => {
                            setEditingId(emp._id);

                            setBasicSalary(
                              emp.basicSalary || 0
                            );

                            setMonthlyHours(
                              emp.monthlyHours || 0
                            );
                          }}
                          className="flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-xl hover:bg-violet-200"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </div>
  );
}