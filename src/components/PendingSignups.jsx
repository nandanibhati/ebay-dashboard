import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { UserPlus, Check, X, Mail, Clock } from "lucide-react";
import { apiFetch } from "../api";

function GlassPanel({ children, className = "", style = {} }) {
  return (
    <div
      className={`relative rounded-[22px] border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_20px_45px_-12px_rgba(30,41,59,0.14)] ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default function PendingSignups({ isAdmin = false }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const fetchPending = async () => {
    try {
      const res = await apiFetch("/api/auth/pending");
      const data = await res.json();
      if (data.success) {
        setPendingUsers(data.pendingUsers);
        setLoaded(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const approve = async (id, role) => {
    try {
      const res = await apiFetch(`/api/auth/approve/${id}`, {
        method: "PUT",
        body: { role },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Account Approved");
        fetchPending();
      } else {
        toast.error(data.message || "Failed to approve");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const reject = async (id) => {
    if (!window.confirm("Reject this signup request?")) return;

    try {
      const res = await apiFetch(`/api/auth/reject/${id}`, { method: "PUT" });
      const data = await res.json();
      if (data.success) {
        toast.success("Signup Request Rejected");
        fetchPending();
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (loaded && pendingUsers.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <GlassPanel className="overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-900/[0.06] bg-white/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: "rgba(244,180,0,0.12)", color: "#B45F06" }}>
              <UserPlus size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-800" style={{ fontFamily: "Sora, sans-serif" }}>
                Pending Signup Requests
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">New accounts waiting for approval before they can log in.</p>
            </div>
          </div>
          {pendingUsers.length > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold shrink-0">
              {pendingUsers.length} waiting
            </span>
          )}
        </div>

        <div className="flex flex-col divide-y divide-slate-900/[0.06]">
          <AnimatePresence>
            {pendingUsers.map((u) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{u.name}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Mail size={11} /> {u.email}
                    <span className="mx-1">·</span>
                    <Clock size={11} />
                    {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isAdmin && (
                    <select
                      id={`role-${u._id}`}
                      defaultValue="employee"
                      className="px-3 py-2 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 outline-none"
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                    </select>
                  )}
                  <button
                    onClick={() =>
                      approve(
                        u._id,
                        isAdmin ? document.getElementById(`role-${u._id}`).value : "employee"
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all active:scale-95"
                  >
                    <Check size={13} className="stroke-[2.5]" />
                    Approve
                  </button>
                  <button
                    onClick={() => reject(u._id)}
                    className="flex items-center justify-center p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all active:scale-95"
                    title="Reject"
                  >
                    <X size={14} className="stroke-[2.5]" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
