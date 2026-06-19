import { useEffect, useState } from "react";
import EmployeeSidebar from "../components/EmployeeSidebar";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "Medium",
    status: "Todo",
    startDate: "",
    dueDate: "",
    progress: 0,
  });

  // Fetch Tasks
  const fetchTasks = async () => {
  try {
    const employeeName =
      localStorage.getItem("employeeName");

    const res = await fetch(
      `https://ebay-dashboard-z7h2.onrender.com/api/tasks/my-tasks/${employeeName}`
    );

   

      const data = await res.json();

      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Employees
  const fetchEmployees = async () => {
    try {
      const res = await fetch(
        "https://ebay-dashboard-z7h2.onrender.com/api/auth/employees"
      );

      const data = await res.json();

      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  // Add / Update Task
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `https://ebay-dashboard-z7h2.onrender.com/api/tasks/${editingId}`
        : "https://ebay-dashboard-z7h2.onrender.com/api/tasks/create";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          assignedBy:
  localStorage.getItem("employeeName") || "Employee",
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          editingId
            ? "Task Updated Successfully"
            : "Task Created Successfully"
        );

        setForm({
          title: "",
          description: "",
          assignedTo: "",
          priority: "Medium",
          status: "Todo",
          startDate: "",
          dueDate: "",
          progress: 0,
        });

        setEditingId(null);

        fetchTasks();
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  // Delete Task
  const deleteTask = async (id) => {
    if (!window.confirm("Delete Task?")) return;

    try {
      const res = await fetch(
        `https://ebay-dashboard-z7h2.onrender.com/api/tasks/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Task Deleted");
        fetchTasks();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Toaster />

      <EmployeeSidebar />

      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              Task Management
            </h1>

            <p className="text-gray-500 mt-2">
              Manage Team Tasks
            </p>
          </div>
        </div>

        {/* Form */}

        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-lg p-6 grid md:grid-cols-2 gap-4 mb-8"
        >
          <input
            type="text"
            placeholder="Task Title"
            className="border p-3 rounded-xl"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            required
          />

          <select
            className="border p-3 rounded-xl"
            value={form.assignedTo}
            onChange={(e) =>
              setForm({
                ...form,
                assignedTo: e.target.value,
              })
            }
            required
          >
            <option value="">
              Assign Employee
            </option>

            {employees.map((emp) => (
              <option
                key={emp._id}
                value={emp.name}
              >
                {emp.name}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Description"
            className="border p-3 rounded-xl md:col-span-2"
            rows="3"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />

          <select
            className="border p-3 rounded-xl"
            value={form.priority}
            onChange={(e) =>
              setForm({
                ...form,
                priority: e.target.value,
              })
            }
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <select
            className="border p-3 rounded-xl"
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value,
              })
            }
          >
            <option>Todo</option>
            <option>In Progress</option>
            <option>Done</option>
            <option>Closed</option>
          </select>

          <input
            type="date"
            className="border p-3 rounded-xl"
            value={form.startDate}
            onChange={(e) =>
              setForm({
                ...form,
                startDate: e.target.value,
              })
            }
          />

          <input
            type="date"
            className="border p-3 rounded-xl"
            value={form.dueDate}
            onChange={(e) =>
              setForm({
                ...form,
                dueDate: e.target.value,
              })
            }
          />

          <button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl md:col-span-2 hover:scale-[1.02] transition"
          >
            {editingId
              ? "Update Task"
              : "Create Task"}
          </button>
        </motion.form>

        {/* Tasks Table */}

        <div className="bg-white rounded-3xl shadow-lg overflow-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">
                  Task
                </th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Progress</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task._id}
                  className="border-b hover:bg-slate-50"
                >
                  <td className="p-4">
                    <p className="font-semibold">
                      {task.title}
                    </p>

                    <p className="text-sm text-gray-500">
                      {task.description}
                    </p>
                  </td>

                  <td>{task.assignedTo}</td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-white ${
                        task.priority === "High"
                          ? "bg-red-500"
                          : task.priority ===
                            "Medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  <td>{task.status}</td>

                  <td>{task.dueDate}</td>

                  <td>
                    <div className="w-28 bg-gray-200 rounded-full">
                      <div
                        className="bg-blue-600 text-xs text-white text-center rounded-full"
                        style={{
                          width: `${task.progress}%`,
                        }}
                      >
                        {task.progress}%
                      </div>
                    </div>
                  </td>

                  <td>
                    <button
                      onClick={() => {
                        setEditingId(task._id);

                        setForm({
                          title: task.title,
                          description:
                            task.description,
                          assignedTo:
                            task.assignedTo,
                          priority: task.priority,
                          status: task.status,
                          startDate:
                            task.startDate,
                          dueDate:
                            task.dueDate,
                          progress:
                            task.progress,
                        });
                      }}
                      className="bg-blue-500 text-white p-2 rounded"
                    >
                      <FaEdit />
                    </button>
                  </td>

                  <td>
                    <button
                      onClick={() =>
                        deleteTask(task._id)
                      }
                      className="bg-red-500 text-white p-2 rounded"
                    >
                      <FaTrash />
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