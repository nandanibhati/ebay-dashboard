import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, MessageCircle, ClipboardList, Wallet } from "lucide-react";
import socket from "../socket";
import { apiFetch } from "../api";
import { isSalaryDueToday } from "../utils/salary";

const MAX_NOTIFICATIONS = 20;

function timeAgo(ts) {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const currentUser = {
    name: localStorage.getItem("employeeName"),
    email: localStorage.getItem("employeeEmail"),
    role: localStorage.getItem("role"),
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const addNotification = (entry) => {
      setNotifications((prev) =>
        [{ id: `${Date.now()}-${Math.random()}`, read: false, time: Date.now(), ...entry }, ...prev].slice(
          0,
          MAX_NOTIFICATIONS
        )
      );
    };

    const onNewMessage = (message) => {
      if (!currentUser.email || message.senderEmail === currentUser.email) return;

      const isForMe =
        message.chatType === "group" || message.receiverEmail === currentUser.email;
      if (!isForMe) return;

      addNotification({
        type: "chat",
        title: message.senderName || "New message",
        subtitle: message.message || (message.image ? "Sent an image" : "Sent an attachment"),
        link: "/chat",
      });
    };

    const onTaskAssigned = (data) => {
      if (!currentUser.name || data.assignedToName !== currentUser.name) return;
      if (data.assignedByName === currentUser.name) return;

      addNotification({
        type: "task",
        title: "New task assigned",
        subtitle: data.title,
        link: currentUser.role === "admin" ? "/tasks" : "/employee-tasks",
      });
    };

    socket.on("newMessage", onNewMessage);
    socket.on("taskAssigned", onTaskAssigned);

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("taskAssigned", onTaskAssigned);
    };
  }, [currentUser.email, currentUser.name, currentUser.role]);

  // Admin-only: flag any employee whose recurring payday (joining date +
  // 15 days, every month) is today and hasn't been marked paid yet.
  useEffect(() => {
    if (currentUser.role !== "admin") return;

    apiFetch("/api/auth/employees")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;

        data.employees.filter((e) => isSalaryDueToday(e)).forEach((e) => {
          setNotifications((prev) =>
            [
              {
                id: `salary-${e._id}`,
                read: false,
                time: Date.now(),
                type: "salary",
                title: "Salary due today",
                subtitle: `${e.name} — payday`,
                link: "/admin-salary",
              },
              ...prev,
            ].slice(0, MAX_NOTIFICATIONS)
          );
        });
      })
      .catch(() => {});
  }, [currentUser.role]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const openNotification = (n) => {
    setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)));
    setOpen(false);
    navigate(n.link);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-900/[0.05] transition border border-slate-900/[0.07]"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[15px] h-[15px] px-[3px] rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-800">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-semibold text-[#B45F06] hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">
              Nothing new yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => openNotification(n)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 ${
                    !n.read ? "bg-amber-50/40" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      n.type === "chat"
                        ? "bg-amber-100 text-[#B45F06]"
                        : n.type === "salary"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {n.type === "chat" ? (
                      <MessageCircle size={14} />
                    ) : n.type === "salary" ? (
                      <Wallet size={14} />
                    ) : (
                      <ClipboardList size={14} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 truncate">{n.title}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{n.subtitle}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.time)}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-[#F4B400] flex-shrink-0 mt-1" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
