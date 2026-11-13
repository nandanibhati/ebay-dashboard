import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Menu,
  X,
  FileText,
  Banknote,
  RotateCcw,
  Scale,
  Pencil,
  Trash2,
  Paperclip,
  Search,
  Plus,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { apiFetch } from "../api";

/* Design tokens - BuildMaster reference palette
   Gold: #F4B400  Blue: #2563EB  Emerald: #22C55E
   Amber: #F59E0B  Red: #EF4444  Dark navy: #0F172A
*/

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

const MONO = { fontFamily: "'JetBrains Mono', monospace" };
const SORA = { fontFamily: "Sora, sans-serif" };

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const money = (n) => gbp.format(Number(n || 0));

const todayStr = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

const formatDay = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const TYPES = {
  Invoice: {
    label: "Invoice",
    icon: FileText,
    refLabel: "Invoice No.",
    dateLabel: "Invoice Date",
    refPlaceholder: "e.g. INV-1042",
    sign: "+",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    amount: "text-slate-900",
  },
  Return: {
    label: "Return",
    icon: RotateCcw,
    refLabel: "Device / IMEI",
    dateLabel: "Return Date",
    refPlaceholder: "e.g. iPhone 13 – IMEI 3567…",
    sign: "−",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    amount: "text-amber-600",
  },
  Payment: {
    label: "Payment",
    icon: Banknote,
    refLabel: "Payment Ref.",
    dateLabel: "Payment Date",
    refPlaceholder: "e.g. Bank transfer ref",
    sign: "−",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amount: "text-emerald-600",
  },
};

const emptyForm = () => ({
  type: "Invoice",
  supplier: "",
  date: todayStr(),
  amount: "",
  reference: "",
  notes: "",
  file: null,
  existingFile: "",
  existingFileName: "",
  removeFile: false,
});

const inputCls =
  "w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#F4B400]/40 focus:border-[#F4B400] transition-all duration-200";
const labelCls = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

function totalsOf(entries) {
  const t = { Invoice: 0, Return: 0, Payment: 0 };
  entries.forEach((e) => {
    t[e.type] += Number(e.amount || 0);
  });
  return { ...t, due: t.Invoice - t.Return - t.Payment };
}

function DueAmount({ value, className = "" }) {
  const color = value > 0.005 ? "text-red-600" : value < -0.005 ? "text-emerald-600" : "text-slate-500";
  return (
    <span className={`tabular-nums font-bold ${color} ${className}`} style={MONO}>
      {money(Math.abs(value))}
      {value < -0.005 && <span className="text-[10px] font-semibold ml-1">CR</span>}
    </span>
  );
}

// Add or edit a vendor. `vendor` has an _id when editing an existing one.
function VendorModal({ vendor, onClose, onSaved }) {
  const isEdit = Boolean(vendor._id);
  const [form, setForm] = useState({
    name: vendor.name || "",
    contactPerson: vendor.contactPerson || "",
    phone: vendor.phone || "",
    email: vendor.email || "",
    notes: vendor.notes || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch(isEdit ? `/api/supplier-ledger/vendors/${vendor._id}` : "/api/supplier-ledger/vendors", {
        method: isEdit ? "PUT" : "POST",
        body: form,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isEdit ? "Vendor updated" : "Vendor added");
        onSaved(data.vendor, isEdit ? vendor.name : null);
      } else {
        toast.error(data.message || "Failed to save vendor");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-800" style={SORA}>
            {isEdit ? "Edit Vendor" : "Add Vendor"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className={labelCls}>Vendor Name *</label>
            <input
              type="text"
              required
              autoFocus
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {isEdit && form.name.trim() !== vendor.name && (
              <p className="text-[11px] text-amber-600 mt-1">All existing entries for {vendor.name} will be renamed too.</p>
            )}
          </div>
          <div>
            <label className={labelCls}>Contact Person</label>
            <input type="text" className={inputCls} value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Phone</label>
              <input type="tel" className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea rows="2" className={`${inputCls} resize-none`} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-[#0F172A] active:scale-[0.98] transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)", boxShadow: "0 8px 22px -4px rgba(244,180,0,0.4)" }}
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Vendor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SupplierLedger() {
  const role = localStorage.getItem("role");

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  const [supplierFilter, setSupplierFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");

  const [vendors, setVendors] = useState([]);
  // null when closed; otherwise the vendor being edited ({} for a new one).
  const [vendorModal, setVendorModal] = useState(null);

  const loadEntries = async () => {
    try {
      const res = await apiFetch("/api/supplier-ledger");
      const data = await res.json();
      if (data.success) setEntries(data.entries);
      else toast.error(data.message || "Failed to load ledger");
    } catch (error) {
      console.log(error);
      toast.error("Failed to load ledger");
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    try {
      const res = await apiFetch("/api/supplier-ledger/vendors");
      const data = await res.json();
      if (data.success) setVendors(data.vendors);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    ensureFonts();
    if (role === "admin") {
      loadEntries();
      loadVendors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Every vendor, plus any supplier name used on an entry without a vendor
  // record, so no balance is ever hidden.
  const suppliers = useMemo(
    () =>
      [...new Set([...vendors.map((v) => v.name), ...entries.map((e) => e.supplier)])].sort((a, b) =>
        a.localeCompare(b)
      ),
    [entries, vendors]
  );

  // Balances are always all-time: what is owed right now.
  const balances = useMemo(
    () =>
      suppliers
        .map((name) => ({
          name,
          vendor: vendors.find((v) => v.name === name) || null,
          entryCount: entries.filter((e) => e.supplier === name).length,
          ...totalsOf(entries.filter((e) => e.supplier === name)),
        }))
        .sort((a, b) => b.due - a.due || a.name.localeCompare(b.name)),
    [entries, suppliers, vendors]
  );

  const deleteVendor = async (vendor) => {
    if (!window.confirm(`Delete vendor "${vendor.name}"?`)) return;
    try {
      const res = await apiFetch(`/api/supplier-ledger/vendors/${vendor._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Vendor deleted");
        if (supplierFilter === vendor.name) setSupplierFilter("All");
        loadVendors();
      } else {
        toast.error(data.message || "Failed to delete vendor");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const handleVendorSaved = (vendor, oldName) => {
    loadVendors();
    if (oldName && oldName !== vendor.name) {
      // Entries were renamed on the server too.
      loadEntries();
      if (supplierFilter === oldName) setSupplierFilter(vendor.name);
      if (form.supplier === oldName) setForm((f) => ({ ...f, supplier: vendor.name }));
    }
    if (vendorModal?.selectAfterSave) setForm((f) => ({ ...f, supplier: vendor.name }));
    setVendorModal(null);
  };

  const scopeTotals = useMemo(
    () => totalsOf(supplierFilter === "All" ? entries : entries.filter((e) => e.supplier === supplierFilter)),
    [entries, supplierFilter]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (supplierFilter !== "All" && e.supplier !== supplierFilter) return false;
      if (typeFilter !== "All" && e.type !== typeFilter) return false;
      if (fromDate && e.date < fromDate) return false;
      if (toDate && e.date > toDate) return false;
      if (q && !`${e.supplier} ${e.reference} ${e.notes}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [entries, supplierFilter, typeFilter, fromDate, toDate, search]);

  const days = useMemo(() => {
    const map = new Map();
    filtered.forEach((e) => {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date).push(e);
    });
    return [...map.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, items]) => ({ date, items, totals: totalsOf(items) }));
  }, [filtered]);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setFileInputKey((k) => k + 1);
  };

  const startEdit = (entry) => {
    setEditingId(entry._id);
    setForm({
      type: entry.type,
      supplier: entry.supplier,
      date: entry.date,
      amount: entry.amount,
      reference: entry.reference || "",
      notes: entry.notes || "",
      file: null,
      existingFile: entry.file || "",
      existingFileName: entry.fileName || "",
      removeFile: false,
    });
    setFileInputKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(form.amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    const formData = new FormData();
    ["type", "supplier", "date", "amount", "reference", "notes"].forEach((key) =>
      formData.append(key, typeof form[key] === "string" ? form[key].trim() : form[key])
    );
    if (form.file) formData.append("file", form.file);
    if (editingId && form.removeFile) formData.append("removeFile", "true");
    if (!editingId) formData.append("createdBy", localStorage.getItem("employeeName") || "");

    setSaving(true);
    try {
      const res = await apiFetch(editingId ? `/api/supplier-ledger/${editingId}` : "/api/supplier-ledger", {
        method: editingId ? "PUT" : "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? "Entry updated" : `${form.type} added`);
        resetForm();
        loadEntries();
      } else {
        toast.error(data.message || "Failed to save entry");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (entry) => {
    if (!window.confirm(`Delete this ${entry.type.toLowerCase()} of ${money(entry.amount)} for ${entry.supplier}?`)) return;
    try {
      const res = await apiFetch(`/api/supplier-ledger/${entry._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Entry deleted");
        if (editingId === entry._id) resetForm();
        loadEntries();
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

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

  const typeCfg = TYPES[form.type];
  const hasFilters = supplierFilter !== "All" || typeFilter !== "All" || fromDate || toDate || search;

  return (
    <div className="min-h-screen w-full relative" style={{ background: "#F8FAFC", fontFamily: "Inter, ui-sans-serif, system-ui" }}>
      <Toaster position="top-right" reverseOrder={false} />
      {vendorModal && (
        <VendorModal vendor={vendorModal} onClose={() => setVendorModal(null)} onSaved={handleVendorSaved} />
      )}
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
            <Sidebar />
          </div>
        </div>
      )}

      <div className="p-4 lg:p-8 max-w-[1300px]">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-900/[0.05] transition border border-slate-900/[0.08] bg-white shrink-0"
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-semibold text-slate-500" style={SORA}>
            Invoices &amp; Payments
          </span>
        </div>

        {/* Hero */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-lg"
          style={{ background: "linear-gradient(150deg, #0F172A, #1E293B)", boxShadow: "0 20px 45px -12px rgba(15,23,42,0.35)" }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-2xl" style={{ background: "rgba(244,180,0,0.18)" }} />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full blur-2xl" style={{ background: "rgba(37,99,235,0.18)" }} />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#F4B400" }}>Admin</p>
              <h1 className="text-3xl font-bold tracking-tight" style={SORA}>Supplier Ledger</h1>
              <p className="mt-1.5 text-slate-400 text-sm max-w-md">
                Invoices − Returns − Payments = what's still due to each supplier.
              </p>
            </div>
            <div
              className="flex items-center gap-3 backdrop-blur-sm border rounded-2xl px-4 py-2.5"
              style={{ background: "rgba(244,180,0,0.12)", borderColor: "rgba(244,180,0,0.3)" }}
            >
              <span className="text-2xl font-bold tabular-nums" style={MONO}>
                {money(Math.abs(scopeTotals.due))}
                {scopeTotals.due < -0.005 && <span className="text-xs ml-1">CR</span>}
              </span>
              <span className="text-slate-300 text-sm leading-tight">
                Total Due
                <br />
                <span className="text-slate-400 text-xs">{supplierFilter === "All" ? "All suppliers" : supplierFilter}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Invoiced", value: money(scopeTotals.Invoice), icon: FileText, color: "text-slate-800", tint: "#2563EB" },
            { label: "Returns", value: `− ${money(scopeTotals.Return)}`, icon: RotateCcw, color: "text-amber-600", tint: "#F59E0B" },
            { label: "Paid", value: `− ${money(scopeTotals.Payment)}`, icon: Banknote, color: "text-emerald-600", tint: "#22C55E" },
            {
              label: "Due",
              value: (
                <>
                  {money(Math.abs(scopeTotals.due))}
                  {scopeTotals.due < -0.005 && <span className="text-sm ml-1">CR</span>}
                </>
              ),
              icon: Scale,
              color: scopeTotals.due > 0.005 ? "text-red-600" : scopeTotals.due < -0.005 ? "text-emerald-600" : "text-slate-500",
              tint: "#EF4444",
            },
          ].map(({ label, value, icon: Icon, color, tint }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest">{label}</span>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${tint}14`, color: tint }}>
                  <Icon size={16} />
                </span>
              </div>
              <p className={`text-xl sm:text-2xl font-bold tracking-tight tabular-nums ${color}`} style={MONO}>{value}</p>
            </div>
          ))}
        </div>

        {/* Supplier balances */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-8 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-bold text-slate-800" style={SORA}>Vendors &amp; Balances</h2>
              <p className="text-xs text-slate-400 mt-0.5">All-time totals. Click a vendor to filter the entries below.</p>
            </div>
            <div className="flex items-center gap-3">
              {supplierFilter !== "All" && (
                <button onClick={() => setSupplierFilter("All")} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                  ✕ Show all
                </button>
              )}
              <button
                onClick={() => setVendorModal({})}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#0F172A] active:scale-[0.98] transition-all"
                style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)", boxShadow: "0 4px 12px -2px rgba(244,180,0,0.4)" }}
              >
                <Plus size={14} className="stroke-[2.5]" />
                Add Vendor
              </button>
            </div>
          </div>
          {balances.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">
              {loading ? "Loading…" : "No vendors yet. Click Add Vendor to get started."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                    <th className="text-left px-5 py-2.5">Vendor</th>
                    <th className="text-right px-4 py-2.5">Invoiced</th>
                    <th className="text-right px-4 py-2.5">Returns</th>
                    <th className="text-right px-4 py-2.5">Paid</th>
                    <th className="text-right px-4 py-2.5">Due</th>
                    <th className="px-3 py-2.5 w-[76px]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {balances.map((b) => (
                    <tr
                      key={b.name}
                      onClick={() => setSupplierFilter(supplierFilter === b.name ? "All" : b.name)}
                      className={`cursor-pointer transition-colors ${supplierFilter === b.name ? "bg-amber-50/70" : "hover:bg-slate-50"}`}
                    >
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-800">{b.name}</p>
                        {b.vendor && (b.vendor.contactPerson || b.vendor.phone || b.vendor.email) && (
                          <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                            {[b.vendor.contactPerson, b.vendor.phone, b.vendor.email].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-700" style={MONO}>{money(b.Invoice)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-amber-600" style={MONO}>{money(b.Return)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-emerald-600" style={MONO}>{money(b.Payment)}</td>
                      <td className="px-4 py-3 text-right"><DueAmount value={b.due} /></td>
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setVendorModal(b.vendor || { name: b.name })}
                            title={b.vendor ? "Edit vendor" : "Save as vendor"}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                          {b.vendor && b.entryCount === 0 && (
                            <button
                              onClick={() => deleteVendor(b.vendor)}
                              title="Delete vendor"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 lg:sticky lg:top-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-slate-800" style={SORA}>
                  {editingId ? "Edit Entry" : "New Entry"}
                </h2>
                {editingId && (
                  <button onClick={resetForm} className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors">
                    ✕ Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  {Object.values(TYPES).map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setForm({ ...form, type: label })}
                      className="flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg transition-all"
                      style={
                        form.type === label
                          ? { background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A", boxShadow: "0 4px 12px -2px rgba(244,180,0,0.4)" }
                          : { color: "#64748B" }
                      }
                    >
                      <Icon size={13} />
                      {label}
                    </button>
                  ))}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Vendor *</label>
                    <button
                      type="button"
                      onClick={() => setVendorModal({ selectAfterSave: true })}
                      className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700"
                    >
                      <Plus size={12} className="stroke-[2.5]" />
                      New vendor
                    </button>
                  </div>
                  <select
                    required
                    className={inputCls}
                    value={form.supplier}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  >
                    <option value="">{suppliers.length ? "Select vendor" : "Add a vendor first"}</option>
                    {suppliers.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>{typeCfg.dateLabel} *</label>
                    <input type="date" required className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Amount (£) *</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      placeholder="0.00"
                      className={inputCls}
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>{typeCfg.refLabel}</label>
                  <input
                    type="text"
                    placeholder={typeCfg.refPlaceholder}
                    className={inputCls}
                    value={form.reference}
                    onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea
                    rows="2"
                    className={`${inputCls} resize-none`}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelCls}>{form.type === "Invoice" ? "Invoice File" : "Attachment"} (PDF / image)</label>
                  {editingId && form.existingFile && !form.removeFile && !form.file && (
                    <div className="flex items-center justify-between gap-2 mb-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <a href={form.existingFile} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 font-semibold truncate hover:underline">
                        <Paperclip size={12} className="shrink-0" />
                        <span className="truncate">{form.existingFileName || "Current file"}</span>
                      </a>
                      <button type="button" onClick={() => setForm({ ...form, removeFile: true })} className="text-slate-400 hover:text-red-600 font-semibold shrink-0">
                        Remove
                      </button>
                    </div>
                  )}
                  <input
                    key={fileInputKey}
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-slate-200 file:text-slate-700 file:text-xs file:font-semibold`}
                    onChange={(e) => setForm({ ...form, file: e.target.files[0] || null })}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Max 10MB.{editingId && form.existingFile ? " Choosing a file replaces the current one." : ""}</p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl text-sm font-bold active:scale-[0.98] transition-all duration-200 text-[#0F172A] disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)", boxShadow: "0 8px 22px -4px rgba(244,180,0,0.4)" }}
                >
                  {saving ? "Saving…" : editingId ? "Save Changes" : `Add ${form.type}`}
                </button>
              </form>
            </div>
          </div>

          {/* Entries by day */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4 flex flex-col gap-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search supplier, invoice no., IMEI, notes…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm pl-9 pr-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#F4B400]/40 focus:border-[#F4B400] transition-all"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)} className="border border-slate-200 bg-slate-50 text-sm px-3 py-2 rounded-xl outline-none focus:border-[#F4B400] max-w-full">
                  <option value="All">All suppliers</option>
                  {suppliers.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="flex gap-1">
                  {["All", "Invoice", "Return", "Payment"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className="text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                      style={
                        typeFilter === t
                          ? { background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A" }
                          : { background: "#F1F5F9", color: "#64748B" }
                      }
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-slate-200 bg-slate-50 px-2 py-1.5 rounded-lg text-sm" title="From" />
                  <span>to</span>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-slate-200 bg-slate-50 px-2 py-1.5 rounded-lg text-sm" title="To" />
                </div>
                {hasFilters && (
                  <button
                    onClick={() => { setSupplierFilter("All"); setTypeFilter("All"); setFromDate(""); setToDate(""); setSearch(""); }}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-700 ml-auto"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {days.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center text-sm text-slate-400">
                {loading ? "Loading…" : hasFilters ? "No entries match these filters." : "No entries yet."}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {days.map(({ date, items, totals }) => (
                  <div key={date} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-700" style={SORA}>{formatDay(date)}</span>
                      <span className="flex items-center gap-3 text-[11px] font-semibold tabular-nums" style={MONO}>
                        {totals.Invoice > 0 && <span className="text-slate-600">+{money(totals.Invoice)}</span>}
                        {totals.Return > 0 && <span className="text-amber-600">−{money(totals.Return)}</span>}
                        {totals.Payment > 0 && <span className="text-emerald-600">−{money(totals.Payment)}</span>}
                      </span>
                    </div>
                    <ul className="divide-y divide-slate-100">
                      {items.map((entry) => {
                        const cfg = TYPES[entry.type];
                        return (
                          <li key={entry._id} className={`px-4 py-3 flex items-start gap-3 ${editingId === entry._id ? "bg-amber-50/60" : ""}`}>
                            <span className={`mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border shrink-0 ${cfg.badge}`}>
                              <cfg.icon size={11} />
                              {cfg.label}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{entry.supplier}</p>
                              {entry.type === "Return" && (
                                <p className="text-[11px] font-semibold text-amber-600">Returned on {formatDay(entry.date)}</p>
                              )}
                              {(entry.reference || entry.notes) && (
                                <p className="text-xs text-slate-500 truncate" title={[entry.reference, entry.notes].filter(Boolean).join(" · ")}>
                                  {[entry.reference, entry.notes].filter(Boolean).join(" · ")}
                                </p>
                              )}
                              {entry.file && (
                                <a href={entry.file} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-blue-600 hover:underline max-w-full">
                                  <Paperclip size={11} className="shrink-0" />
                                  <span className="truncate">{entry.fileName || "View file"}</span>
                                </a>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className={`text-sm font-bold tabular-nums ${cfg.amount}`} style={MONO}>
                                {cfg.sign}{money(entry.amount)}
                              </span>
                              <div className="flex gap-1">
                                <button onClick={() => startEdit(entry)} title="Edit" className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                                  <Pencil size={13} />
                                </button>
                                <button onClick={() => deleteEntry(entry)} title="Delete" className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
