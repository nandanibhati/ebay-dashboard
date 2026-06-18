import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function AdminAttendance() {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    fetch(
      "https://ebay-dashboard-z7h2.onrender.com/api/attendance"
    )
      .then((res) => res.json())
      .then((data) => setAttendance(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold mb-6">
          Attendance Management
        </h1>

        <div className="bg-white rounded-xl shadow overflow-auto">
          <table className="w-full">
            <thead className="bg-slate-200">
              <tr>
                <th className="p-3">Employee</th>
                <th>Date</th>
                <th>Punch In</th>
                <th>Punch Out</th>
                <th>Hours</th>
              </tr>
            </thead>

            <tbody>
              {attendance.map((item) => (
                <tr
                  key={item._id}
                  className="border-b"
                >
                  <td className="p-3">
                    {item.employeeName}
                  </td>

                  <td>{item.date}</td>

                  <td>{item.punchIn || "-"}</td>

                  <td>{item.punchOut || "-"}</td>

                  <td>
                    {item.totalHours || 0}
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