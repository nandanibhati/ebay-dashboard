import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Employees() {
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
  name: "",
  email: "",
  password: "",
  employeeId: "",
  joiningDate: "",
  hourlyRate: "",
  basicSalary: "",
});

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

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "https://ebay-dashboard-z7h2.onrender.com/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            role: "employee",
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Employee Added");

        setForm({
          name: "",
          email: "",
          password: "",
          employeeId: "",
          joiningDate: "",
          hourlyRate: "",
           basicSalary: "",
        });

        fetchEmployees();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm("Delete Employee?")) return;

    try {
      const res = await fetch(
        `https://ebay-dashboard-z7h2.onrender.com/api/auth/employee/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (data.success) {
        fetchEmployees();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">
          Employees
        </h1>

        <form
          onSubmit={handleAddEmployee}
          className="bg-white p-6 rounded-xl shadow mb-8 grid grid-cols-2 gap-4"
        >
          <input
            type="text"
            placeholder="Employee Name"
            className="border p-3 rounded"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <input
            type="email"
            placeholder="Email"
            className="border p-3 rounded"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="border p-3 rounded"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Employee ID"
            className="border p-3 rounded"
            value={form.employeeId}
            onChange={(e) =>
              setForm({
                ...form,
                employeeId: e.target.value,
              })
            }
          />

          <input
            type="date"
            className="border p-3 rounded"
            value={form.joiningDate}
            onChange={(e) =>
              setForm({
                ...form,
                joiningDate: e.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="Hourly Rate"
            className="border p-3 rounded"
            value={form.hourlyRate}
            onChange={(e) =>
              setForm({
                ...form,
                hourlyRate: e.target.value,
              })
            }
          />
          <input
  type="number"
  placeholder="Basic Salary"
  className="border p-3 rounded"
  value={form.basicSalary}
  onChange={(e) =>
    setForm({
      ...form,
      basicSalary: e.target.value,
    })
  }
/>
<button
  className="bg-blue-600 text-white p-3 rounded col-span-2"
  type="submit"
>
  {editingId
    ? "Update Employee"
    : "Add Employee"}
</button>
        </form>

        <div className="bg-white rounded-xl shadow overflow-auto">
          <table className="w-full">
            <thead className="bg-slate-200">
              <tr>
                <th className="p-3">Name</th>
                <th>Email</th>
                <th>Employee ID</th>
                <th>Joining Date</th>
                <th>Hourly Rate</th>
                <th>Basic Salary</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp._id}
                  className="border-b"
                >
                  <td className="p-3">{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.employeeId}</td>
                  <td>
                    {emp.joiningDate
                      ? new Date(
                          emp.joiningDate
                        ).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>₹{emp.hourlyRate || 0}</td>

<td>₹{emp.basicSalary || 0}</td>

<td>
 <button
  onClick={() => {
    setEditingId(emp._id);

    setForm({
      name: emp.name || "",
      email: emp.email || "",
      password: "",
      employeeId: emp.employeeId || "",
      joiningDate: emp.joiningDate
        ? emp.joiningDate.split("T")[0]
        : "",
      hourlyRate: emp.hourlyRate || "",
      basicSalary: emp.basicSalary || "",
    });
  }}
  className="bg-blue-500 text-white px-3 py-1 rounded"
>
  Edit
</button>
</td>

<td>
  <button
    onClick={() =>
      deleteEmployee(emp._id)
    }
    className="bg-red-500 text-white px-3 py-1 rounded"
  >
    Delete
  </button>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}