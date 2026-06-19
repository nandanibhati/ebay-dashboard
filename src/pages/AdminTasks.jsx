import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { FaTrash, FaEdit } from "react-icons/fa";
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
      const res = await fetch(
        "https://ebay-dashboard-z7h2.onrender.com/api/tasks"
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
            localStorage.getItem("adminName") || "Admin",
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

      <Sidebar />

      <div className="flex-1 ml-64 p-8">
     <div className="space-y-6 mb-8">

  <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
    <h1 className="text-3xl font-bold">
      Team Task Management 📋
    </h1>

    <p className="mt-2 text-violet-100">
      Create, assign and track team tasks efficiently.
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

    <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
      <p className="text-gray-500 text-sm">
        Total Tasks
      </p>

      <h2 className="text-3xl font-bold mt-2">
        {tasks.length}
      </h2>
    </div>

    <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
      <p className="text-gray-500 text-sm">
        Pending
      </p>

      <h2 className="text-3xl font-bold text-yellow-500 mt-2">
        {
          tasks.filter(
            (t) => t.status === "Todo"
          ).length
        }
      </h2>
    </div>

    <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
      <p className="text-gray-500 text-sm">
        In Progress
      </p>

      <h2 className="text-3xl font-bold text-blue-500 mt-2">
        {
          tasks.filter(
            (t) =>
              t.status === "In Progress"
          ).length
        }
      </h2>
    </div>

    <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
      <p className="text-gray-500 text-sm">
        Completed
      </p>

      <h2 className="text-3xl font-bold text-green-500 mt-2">
        {
          tasks.filter(
            (t) => t.status === "Done"
          ).length
        }
      </h2>
    </div>

  </div>
</div>

        {/* Form */}

        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="
bg-white
rounded-3xl
shadow-xl
border border-gray-100
p-8
grid md:grid-cols-2 gap-5 mb-8
"
        >
            <div className="md:col-span-2 mb-2">
  <h2 className="text-2xl font-bold text-gray-800">
    {editingId
      ? "Update Task ✏️"
      : "Create New Task 🚀"}
  </h2>

  <p className="text-gray-500 mt-1">
    Assign work and track team productivity.
  </p>
</div>
          <input
            type="text"
            placeholder="Task Title"
            className="
border border-gray-200
bg-gray-50
p-4
rounded-2xl
outline-none
focus:ring-2
focus:ring-violet-200
focus:border-violet-500
transition-all
"
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
          className="
border border-gray-200
bg-gray-50
p-4
rounded-2xl
outline-none
focus:ring-2
focus:ring-violet-200
focus:border-violet-500
transition-all
"
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
            className="
border border-gray-200
bg-gray-50
p-4
rounded-2xl
outline-none
focus:ring-2
focus:ring-violet-200
focus:border-violet-500
transition-all
md:col-span-2
"
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
            className="
border border-gray-200
bg-gray-50
p-4
rounded-2xl
outline-none
focus:ring-2
focus:ring-violet-200
focus:border-violet-500
transition-all
"
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
            className="
border border-gray-200
bg-gray-50
p-4
rounded-2xl
outline-none
focus:ring-2
focus:ring-violet-200
focus:border-violet-500
transition-all
"
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
           className="
border border-gray-200
bg-gray-50
p-4
rounded-2xl
outline-none
focus:ring-2
focus:ring-violet-200
focus:border-violet-500
transition-all
"
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
            className="
border border-gray-200
bg-gray-50
p-4
rounded-2xl
outline-none
focus:ring-2
focus:ring-violet-200
focus:border-violet-500
transition-all
"
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

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr className="text-gray-600">
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
                {tasks.length === 0 && (
  <tr>
    <td
      colSpan="8"
      className="text-center py-16 text-gray-400"
    >
      No tasks found 📋
    </td>
  </tr>
)}
              {tasks.map((task) => (
                <tr
                  key={task._id}
                  className="
border-b
hover:bg-violet-50
transition-all
duration-200
"
                >
                  <td className="p-4">
                    <p className="font-semibold">
                      {task.title}
                    </p>

                    <p className="text-sm text-gray-500">
                      {task.description}
                    </p>
                  </td>

                  <td>
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white flex items-center justify-center font-bold">
      {task.assignedTo?.charAt(0)}
    </div>

    <div>
      <p className="font-medium">
        {task.assignedTo}
      </p>

      <p className="text-xs text-emerald-500">
        ● Active
      </p>
    </div>
  </div>
</td>

                  <td>
                    <span
                     className={`px-3 py-1 rounded-full text-xs font-semibold
${
  task.priority === "High"
    ? "bg-red-100 text-red-700"
    : task.priority === "Medium"
    ? "bg-yellow-100 text-yellow-700"
    : "bg-green-100 text-green-700"
}`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  <td>
  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold
      ${
        task.status === "Done"
          ? "bg-green-100 text-green-700"
          : task.status === "In Progress"
          ? "bg-blue-100 text-blue-700"
          : task.status === "Closed"
          ? "bg-gray-100 text-gray-700"
          : "bg-yellow-100 text-yellow-700"
      }
    `}
  >
    {task.status}
  </span>
</td>

                  <td>
  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
    {task.dueDate}
  </span>
</td>

                  <td>
                    <div className="w-32 bg-gray-200 rounded-full overflow-hidden h-3">
                      <div
                        className="
bg-gradient-to-r
from-violet-600
to-indigo-600
h-3
text-[10px]
text-white
flex
items-center
justify-center
"
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
                      className="
bg-violet-100
text-violet-700
p-3
rounded-xl
hover:bg-violet-200
transition-all
"
                    >
                      <FaEdit />
                    </button>
                  </td>

                  <td>
                    <button
                      onClick={() =>
                        deleteTask(task._id)
                      }
                     className="
bg-red-100
text-red-600
p-3
rounded-xl
hover:bg-red-200
transition-all
"
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