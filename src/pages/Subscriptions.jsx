import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const CYCLE_CONFIG = {
  Monthly: {
    badge: "bg-violet-100 text-violet-700 ring-violet-200",
    dot: "bg-violet-400",
  },
  Yearly: {
    badge: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-400",
  },
};

function CycleBadge({ cycle }) {
  const cfg = CYCLE_CONFIG[cycle] || CYCLE_CONFIG["Monthly"];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cycle}
    </span>
  );
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

function RenewalCell({ dateStr }) {
  const days = daysUntil(dateStr);
  const formatted = dateStr ? new Date(dateStr).toLocaleDateString("en-GB") : "—";
  let urgency = null;
  if (days !== null && days <= 7) urgency = "text-red-500 font-semibold";
  else if (days !== null && days <= 30) urgency = "text-amber-500 font-semibold";

  return (
    <div>
      <span className={`text-sm ${urgency || "text-slate-600"}`}>{formatted}</span>
      {days !== null && days <= 30 && (
        <p className={`text-xs mt-0.5 ${days <= 7 ? "text-red-400" : "text-amber-400"}`}>
          {days <= 0 ? "Overdue!" : `in ${days}d`}
        </p>
      )}
    </div>
  );
}

export default function Subscriptions() {
  const role = localStorage.getItem("role");

  const [subscriptions, setSubscriptions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedNote, setExpandedNote] = useState(null);

  const [form, setForm] = useState({
    serviceName: "",
    amount: "",
    billingCycle: "Monthly",
    renewalDate: "",
    notes: "",
  });

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch("https://ebay-dashboard-z7h2.onrender.com/api/subscriptions");
      const data = await res.json();
      if (data.success) setSubscriptions(data.subscriptions);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchSubscriptions(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveSubscription = async (e) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `https://ebay-dashboard-z7h2.onrender.com/api/subscriptions/${editingId}`
        : "https://ebay-dashboard-z7h2.onrender.com/api/subscriptions";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        alert(editingId ? "Subscription Updated ✅" : "Subscription Added ✅");
        setEditingId(null);
        setForm({ serviceName: "", amount: "", billingCycle: "Monthly", renewalDate: "", notes: "" });
        fetchSubscriptions();
      }
    } catch (err) { console.log(err); }
  };

  const editSubscription = (item) => {
    setEditingId(item._id);
    setForm({ serviceName: item.serviceName, amount: item.amount, billingCycle: item.billingCycle, renewalDate: item.renewalDate, notes: item.notes || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSubscription = async (id) => {
    if (!window.confirm("Delete Subscription?")) return;
    try {
      await fetch(`https://ebay-dashboard-z7h2.onrender.com/api/subscriptions/${id}`, { method: "DELETE" });
      fetchSubscriptions();
    } catch (err) { console.log(err); }
  };

  const filteredSubscriptions = subscriptions.filter((item) =>
    item.serviceName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalMonthlyCost = subscriptions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const monthlyCount = subscriptions.filter(i => i.billingCycle === "Monthly").length;
  const yearlyCount = subscriptions.filter(i => i.billingCycle === "Yearly").length;
  const renewingSoon = subscriptions.filter(i => { const d = daysUntil(i.renewalDate); return d !== null && d <= 30 && d >= 0; }).length;

  if (role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-10 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-red-600 mb-1">Access Denied</h2>
          <p className="text-slate-500 text-sm">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <Sidebar />

      <div className="flex-1 ml-64 p-8 max-w-[1300px]">

        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 rounded-3xl p-8 text-white mb-8 shadow-lg">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-purple-400/30 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-violet-200 text-xs font-semibold uppercase tracking-widest mb-1">Admin</p>
              <h1 className="text-3xl font-extrabold tracking-tight">Subscriptions 🔄</h1>
              <p className="mt-1.5 text-violet-100 text-sm max-w-sm">
                Track recurring services, billing cycles, and renewal dates.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2.5">
              <span className="text-2xl font-extrabold">£{totalMonthlyCost.toFixed(2)}</span>
              <span className="text-violet-100 text-sm leading-tight">Total<br />Cost</span>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Services", value: subscriptions.length, color: "text-slate-800", icon: "📋", gradient: "bg-gradient-to-br from-slate-50 to-violet-50" },
            { label: "Monthly", value: monthlyCount, color: "text-violet-600", icon: "🗓️", gradient: "bg-gradient-to-br from-violet-50/60 to-purple-50/60" },
            { label: "Yearly", value: yearlyCount, color: "text-emerald-600", icon: "📅", gradient: "bg-gradient-to-br from-emerald-50/60 to-teal-50/60" },
            { label: "Renewing Soon", value: renewingSoon, color: renewingSoon > 0 ? "text-amber-500" : "text-slate-400", icon: "⚠️", gradient: "bg-gradient-to-br from-amber-50/60 to-orange-50/60" },
          ].map(({ label, value, color, icon, gradient }) => (
            <div key={label} className="relative bg-white rounded-2xl shadow-sm border border-slate-100 p-5 overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradient}`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest">{label}</span>
                  <span className="text-xl">{icon}</span>
                </div>
                <p className={`text-3xl font-extrabold tracking-tight ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Form Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm transition-colors duration-200 ${editingId ? "bg-amber-500" : "bg-violet-600"}`}>
                    {editingId ? "✏️" : "➕"}
                  </div>
                  <h2 className="text-base font-bold text-slate-800">
                    {editingId ? "Edit Subscription" : "New Subscription"}
                  </h2>
                </div>
                {editingId && (
                  <button
                    onClick={() => { setEditingId(null); setForm({ serviceName: "", amount: "", billingCycle: "Monthly", renewalDate: "", notes: "" }); }}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
                  >
                    ✕ Cancel
                  </button>
                )}
              </div>

              <form onSubmit={saveSubscription} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Service Name</label>
                  <input
                    type="text"
                    name="serviceName"
                    placeholder="e.g. Shopify, Canva…"
                    value={form.serviceName}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Amount (£)</label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Billing Cycle</label>
                  <select
                    name="billingCycle"
                    value={form.billingCycle}
                    onChange={handleChange}
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all duration-200 cursor-pointer"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Renewal Date</label>
                  <input
                    type="date"
                    name="renewalDate"
                    value={form.renewalDate}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Notes</label>
                  <textarea
                    name="notes"
                    placeholder="Optional notes…"
                    value={form.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full text-white py-3 rounded-xl font-semibold text-sm shadow-md active:scale-[0.98] transition-all duration-200 ${
                    editingId
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-200"
                      : "bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 shadow-violet-200"
                  }`}
                >
                  {editingId ? "💾 Update Subscription" : "+ Add Subscription"}
                </button>
              </form>
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-3">

            {/* Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by service name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm pl-9 pr-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800">Active Subscriptions</h2>
                <span className="text-xs text-slate-400 font-medium">
                  {filteredSubscriptions.length} service{filteredSubscriptions.length !== 1 ? "s" : ""}
                </span>
              </div>

              {filteredSubscriptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-slate-500 text-sm font-medium">No subscriptions found.</p>
                  <p className="text-slate-400 text-xs mt-1">Add your first subscription using the form.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {["Service", "Amount", "Cycle", "Renewal", "Notes", ""].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredSubscriptions.map((item) => {
                        const days = daysUntil(item.renewalDate);
                        const isUrgent = days !== null && days <= 7;
                        const isWarning = days !== null && days <= 30 && days > 7;
                        return (
                          <tr
                            key={item._id}
                            className={`hover:bg-slate-50/70 transition-colors duration-100 group ${isUrgent ? "bg-red-50/40" : isWarning ? "bg-amber-50/30" : ""}`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {isUrgent && <span title="Renewing within 7 days" className="text-red-400 text-xs">🔴</span>}
                                {isWarning && <span title="Renewing within 30 days" className="text-amber-400 text-xs">🟡</span>}
                                <span className="font-semibold text-slate-800">{item.serviceName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">
                              £{Number(item.amount).toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <CycleBadge cycle={item.billingCycle} />
                            </td>
                            <td className="px-4 py-3">
                              <RenewalCell dateStr={item.renewalDate} />
                            </td>
                            <td className="px-4 py-3 max-w-[120px]">
                              {item.notes ? (
                                <div>
                                  <button
                                    onClick={() => setExpandedNote(expandedNote === item._id ? null : item._id)}
                                    className="text-xs text-violet-500 hover:text-violet-700 font-semibold transition-colors"
                                  >
                                    {expandedNote === item._id ? "Hide ▲" : "View ▼"}
                                  </button>
                                  {expandedNote === item._id && (
                                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed bg-slate-50 rounded-lg p-2 border border-slate-100">
                                      {item.notes}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-300 italic">None</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                <button
                                  onClick={() => editSubscription(item)}
                                  title="Edit"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-all duration-150 active:scale-95"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteSubscription(item._id)}
                                  title="Delete"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-all duration-150 active:scale-95"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                    <path d="M10 11v6M14 11v6" />
                                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                  </svg>
                                  Del
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
