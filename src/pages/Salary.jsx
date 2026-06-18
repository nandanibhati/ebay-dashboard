import { useEffect, useState } from "react";
import EmployeeSidebar from "../components/EmployeeSidebar";

export default function Salary() {
  const [salaryData, setSalaryData] = useState(null);

  useEffect(() => {
    const email =
      localStorage.getItem("employeeEmail");

    fetch(
      `https://ebay-dashboard-z7h2.onrender.com/api/salary/${email}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSalaryData(data);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <EmployeeSidebar />

      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold mb-6">
          My Salary
        </h1>

        {salaryData && (
          <div className="bg-white p-8 rounded-xl shadow max-w-xl">
            <p className="mb-3">
              <strong>Employee:</strong>{" "}
              {salaryData.employee}
            </p>

            <p className="mb-3">
              <strong>Basic Salary:</strong> ₹
              {salaryData.basicSalary}
            </p>

            <p className="mb-3">
              <strong>Hourly Rate:</strong> ₹
              {salaryData.hourlyRate}
            </p>

            <p className="mb-3">
              <strong>This Month Hours:</strong>{" "}
              {salaryData.totalHours}
            </p>

            <div className="border-t pt-4 mt-4">
              <h2 className="text-4xl font-bold text-green-600">
                ₹{salaryData.salary}
              </h2>

              <p className="text-gray-500 mt-2">
                Total Salary This Month
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}