import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function AdminSalary() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);

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

    fetch(
      "https://ebay-dashboard-z7h2.onrender.com/api/attendance"
    )
      .then((res) => res.json())
      .then((data) => setAttendance(data))
      .catch((err) => console.log(err));
  }, []);

  const getMonthlyHours = (email) => {
    const now = new Date();

    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");

    const year = String(now.getFullYear());

    return attendance
      .filter(
        (item) =>
          item.employeeEmail === email &&
          item.date.startsWith(
            `${year}-${month}`
          )
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.totalHours || 0),
        0
      );
  };

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
}),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Salary Updated Successfully");

        setEditingId(null);
        setBasicSalary("");
        

        fetchEmployees();
      }
    } catch (error) {
      console.log(error);
      alert("Failed to Update Salary");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold mb-6">
          Salary Management
        </h1>

        {editingId && (
          <div className="bg-white p-4 rounded-xl shadow mb-6 flex gap-4">
            <input
              type="number"
              placeholder="Monthly Salary"
              value={basicSalary}
              onChange={(e) =>
                setBasicSalary(e.target.value)
              }
              className="border p-3 rounded"
            />

         

            <button
              onClick={updateSalary}
              className="bg-green-600 text-white px-5 rounded"
            >
              Update
            </button>

            <button
              onClick={() => {
                setEditingId(null);
                setBasicSalary("");
                
              }}
              className="bg-red-500 text-white px-5 rounded"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-auto">
          <table className="w-full">
            <thead className="bg-slate-200">
              <tr>
                <th className="p-3">Employee</th>
                <th>Email</th>
                <th>Monthly Salary</th>
                <th>Monthly Hours</th>
                <th>Total Salary</th>
                <th>Edit</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp) => {
                const hours = getMonthlyHours(
                  emp.email
                );

               const hourlyRate =
  Number(emp.basicSalary || 0) /
  (8 * 6 * 4.33);

const salary = hours * hourlyRate;

                return (
                  <tr
                    key={emp._id}
                    className="border-b"
                  >
                    <td className="p-3">
                      {emp.name}
                    </td>

                    <td>{emp.email}</td>

                    <td>
  ₹{emp.basicSalary || 0}
</td>

<td>
  {hours.toFixed(2)}
</td>

                    <td className="font-bold text-green-600">
                      ₹
                      {salary.toFixed(2)}
                    </td>

                    <td>
                      <button
                        onClick={() => {
                          setEditingId(
                            emp._id
                          );

                          setBasicSalary(
                            emp.basicSalary ||
                              0
                          );

                          
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
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
  );
}