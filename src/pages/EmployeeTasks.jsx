import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmployeeSidebar from "../components/EmployeeSidebar";
import TaskManagerBoard from "../components/TaskManagerBoard";
import { Toaster } from "react-hot-toast";
import { Menu, X } from "lucide-react";
import { apiFetch } from "../api";

const FONT_LINK_ID = "ebay-dash-fonts";
function ensureFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700&display=swap";
  document.head.appendChild(link);
}

function PremiumBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute inset-0" style={{ background: "#F8FAFC" }} />
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 90%)",
        }}
      />
      <div
        className="absolute -top-40 -left-32 w-[36rem] h-[36rem] rounded-full blur-3xl anim-drift-a"
        style={{ background: "radial-gradient(circle, rgba(244,180,0,0.10), transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 right-0 w-[30rem] h-[30rem] rounded-full blur-3xl anim-drift-b"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-[26rem] h-[26rem] rounded-full blur-3xl anim-drift-c"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.07), transparent 70%)" }}
      />
    </div>
  );
}

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams] = useSearchParams();

  const employeeName = localStorage.getItem("employeeName") || "Employee";

  useEffect(() => {
    ensureFonts();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await apiFetch(`/api/tasks/my-tasks/${employeeName}`);
      const data = await res.json();
      if (data.success) setTasks(data.tasks);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await apiFetch("/api/auth/employees");
      const data = await res.json();
      if (data.success) setEmployees(data.employees);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui", color: "#0F172A" }}
    >
      <PremiumBackground />
      <Toaster position="top-right" reverseOrder={false} />

      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 shadow-2xl anim-slide-in">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={17} />
            </button>
            <EmployeeSidebar />
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 h-[72px] flex items-center gap-3 px-5 lg:px-10 border-b border-slate-900/[0.06] bg-white/70 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-900/[0.05] transition border border-slate-900/[0.06]"
          >
            <Menu size={18} />
          </button>
          <h1 className="text-sm font-semibold text-slate-700 tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>
            Task Manager
          </h1>
        </header>

        <div className="flex-1 px-5 lg:px-10 py-8 max-w-[1800px] mx-auto w-full">
          <TaskManagerBoard
            tasks={tasks}
            employees={employees}
            currentUserName={employeeName}
            onTasksChanged={fetchTasks}
            canManageAutomation={false}
            archivedScopeName={employeeName}
            initialViewMode={searchParams.get("view") === "archived" ? "archived" : "active"}
          />
        </div>
      </div>

      <style>{`
        @keyframes driftA { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,20px); } }
        @keyframes driftB { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-25px,25px); } }
        @keyframes driftC { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-20px); } }
        .anim-drift-a { animation: driftA 14s ease-in-out infinite; }
        .anim-drift-b { animation: driftB 17s ease-in-out infinite; }
        .anim-drift-c { animation: driftC 20s ease-in-out infinite; }

        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .anim-slide-in { animation: slideIn 0.28s cubic-bezier(0.22,1,0.36,1); }

        @media (prefers-reduced-motion: reduce) {
          .anim-drift-a, .anim-drift-b, .anim-drift-c, .anim-slide-in { animation: none !important; }
        }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.12); border-radius: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}
