import EmployeeSidebar from "../components/EmployeeSidebar";

export default function EmployeeDashboard() {
  const employeeName =
    localStorage.getItem("employeeName") || "Employee";

  const handlePunchIn = async () => {
    try {
      const response = await fetch(
        "https://ebay-dashboard-z7h2.onrender.com/api/attendance/punch-in",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId:
              localStorage.getItem("employeeEmail"),
            employeeName:
              localStorage.getItem("employeeName"),
            employeeEmail:
              localStorage.getItem("employeeEmail"),
          }),
        }
      );
      const handlePunchOut = async () => {
  try {
    const response = await fetch(
      "https://ebay-dashboard-z7h2.onrender.com/api/attendance/punch-out",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeEmail:
            localStorage.getItem("employeeEmail"),
        }),
      }
    );

    const data = await response.json();

    alert(data.message);

    console.log(data.attendance);
  } catch (error) {
    console.log(error);
    alert("Punch Out Failed");
  }
};

      const data = await response.json();

      alert(data.message);
    } catch (error) {
      console.log(error);
      alert("Punch In Failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <EmployeeSidebar />

      <div className="flex-1 ml-64 p-8">
        <h1 className="text-4xl font-bold">
          Welcome, {employeeName}
        </h1>

        <p className="text-gray-500 mt-2">
          Employee Dashboard
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-3">
              Attendance
            </h2>

            <p className="text-gray-500">
              Today's Status
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handlePunchIn}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Punch In
              </button>
<button
  onClick={handlePunchOut}
  className="bg-red-600 text-white px-4 py-2 rounded"
>
  Punch Out
</button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-3">
              Leave Summary
            </h2>

            <p>Pending Leaves: 0</p>
            <p>Approved Leaves: 0</p>

            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
              Apply Leave
            </button>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-3">
              Salary Summary
            </h2>

            <p>Current Month Salary</p>

            <h3 className="text-3xl font-bold mt-3">
              ₹0
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}