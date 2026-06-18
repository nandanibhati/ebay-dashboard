import { useState } from "react";
import EmployeeSidebar from "../components/EmployeeSidebar";

export default function Leaves() {
  const [form, setForm] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
    leaveType: "Full Day",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://ebay-dashboard-z7h2.onrender.com/api/leaves/apply",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeName:
              localStorage.getItem("employeeName"),
            employeeEmail:
              localStorage.getItem("employeeEmail"),
            fromDate: form.fromDate,
            toDate: form.toDate,
            reason: form.reason,
            leaveType: form.leaveType,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Leave Applied Successfully ✅");

        setForm({
          fromDate: "",
          toDate: "",
          reason: "",
          leaveType: "Full Day",
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Failed To Apply Leave");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <EmployeeSidebar />

      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold mb-6">
          Apply Leave
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow p-6 max-w-2xl"
        >
          <div className="mb-4">
            <label className="block mb-2">
              From Date
            </label>

            <input
              type="date"
              value={form.fromDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  fromDate: e.target.value,
                })
              }
              className="w-full border p-3 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">
              To Date
            </label>

            <input
              type="date"
              value={form.toDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  toDate: e.target.value,
                })
              }
              className="w-full border p-3 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">
              Leave Type
            </label>

            <select
              value={form.leaveType}
              onChange={(e) =>
                setForm({
                  ...form,
                  leaveType: e.target.value,
                })
              }
              className="w-full border p-3 rounded"
            >
              <option value="Full Day">
                Full Day
              </option>

              <option value="Half Day">
                Half Day
              </option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">
              Reason
            </label>

            <textarea
              value={form.reason}
              onChange={(e) =>
                setForm({
                  ...form,
                  reason: e.target.value,
                })
              }
              className="w-full border p-3 rounded"
              rows="4"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded"
          >
            Apply Leave
          </button>
        </form>
      </div>
    </div>
  );
}