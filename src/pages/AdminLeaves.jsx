import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);

  const fetchLeaves = async () => {
    try {
      const response = await fetch(
        "https://ebay-dashboard-z7h2.onrender.com/api/leaves"
      );

      const data = await response.json();

      if (data.success) {
        setLeaves(data.leaves);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const approveLeave = async (id) => {
    try {
      await fetch(
        `https://ebay-dashboard-z7h2.onrender.com/api/leaves/approve/${id}`,
        {
          method: "PUT",
        }
      );

      fetchLeaves();
    } catch (error) {
      console.log(error);
    }
  };

  const rejectLeave = async (id) => {
    try {
      await fetch(
        `https://ebay-dashboard-z7h2.onrender.com/api/leaves/reject/${id}`,
        {
          method: "PUT",
        }
      );

      fetchLeaves();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">
          Leave Management
        </h1>

        <div className="bg-white rounded-xl shadow overflow-auto">
          <table className="w-full">
            <thead className="bg-slate-200">
              <tr>
                <th className="p-3">Employee</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {leaves.map((leave) => (
                <tr
                  key={leave._id}
                  className="border-b"
                >
                  <td className="p-3">
                    {leave.employeeName}
                  </td>

                  <td>{leave.fromDate}</td>

                  <td>{leave.toDate}</td>

                  <td>{leave.reason}</td>

                  <td>
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        leave.status === "Approved"
                          ? "bg-green-600"
                          : leave.status === "Rejected"
                          ? "bg-red-600"
                          : "bg-yellow-500"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>

                  <td className="space-x-2">
                    <button
                      onClick={() =>
                        approveLeave(leave._id)
                      }
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        rejectLeave(leave._id)
                      }
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject
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