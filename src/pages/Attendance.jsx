import { useEffect, useState } from "react";
import EmployeeSidebar from "../components/EmployeeSidebar";

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    fetch(
      "https://ebay-dashboard-z7h2.onrender.com/api/attendance"
    )
      .then((res) => res.json())
      .then((data) => {
        const email =
          localStorage.getItem("employeeEmail");

        const filtered = data.filter(
          (item) =>
            item.employeeEmail === email
        );

        setAttendance(filtered);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <EmployeeSidebar />

      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold mb-6">
          My Attendance
        </h1>

        <div className="bg-white rounded-xl shadow overflow-auto">
          <table className="w-full">
            <thead className="bg-slate-200">
              <tr>
                <th className="p-3">Date</th>
                <th>Punch In</th>
                <th>Punch Out</th>
                <th>Total Hours</th>
              </tr>
            </thead>

            <tbody>
              {attendance.map((item) => (
                <tr
                  key={item._id}
                  className="border-b"
                >
                  <td className="p-3">
                    {item.date}
                  </td>

                  <td>
                    {item.punchIn || "-"}
                  </td>

                  <td>
                    {item.punchOut || "-"}
                  </td>

                  <td>
                    {item.totalHours || 0}
                  </td>
                </tr>
              ))}

              {attendance.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center p-6"
                  >
                    No Attendance Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}