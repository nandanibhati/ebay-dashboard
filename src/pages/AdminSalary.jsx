import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function AdminSalary() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    fetch(
      "https://ebay-dashboard-z7h2.onrender.com/api/auth/employees"
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEmployees(data.employees);
        }
      });

    fetch(
      "https://ebay-dashboard-z7h2.onrender.com/api/attendance"
    )
      .then((res) => res.json())
      .then((data) => setAttendance(data));
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

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">
          Salary Management
        </h1>

        <div className="bg-white rounded-xl shadow overflow-auto">
          <table className="w-full">
            <thead className="bg-slate-200">
              <tr>
              <th>Employee</th>
<th>Email</th>
<th>Basic Salary</th>
<th>Hourly Rate</th>
<th>Monthly Hours</th>
<th>Total Salary</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp) => {
                const hours =
                  getMonthlyHours(emp.email);

               const salary =
  Number(emp.basicSalary || 0) +
  hours *
  Number(emp.hourlyRate || 0);

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
  ₹{emp.hourlyRate || 0}
</td>

<td>
  {hours.toFixed(2)}
</td>

                    <td className="font-bold text-green-600">
                      ₹{salary.toFixed(2)}
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