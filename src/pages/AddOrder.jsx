import Sidebar from "../components/Sidebar";
import EmployeeSidebar from "../components/EmployeeSidebar";
import { useEffect, useState } from "react";
import {
  ShoppingBag, Calendar, Hash, User, Package, Tag,
  DollarSign, Truck, FileText, ChevronDown, Loader2,
  CheckCircle2, Store, BarChart2, ScanLine, Bell, Search,
  Menu, X,
} from "lucide-react";
import { apiFetch } from "../api";

/* Design tokens - matched to BuildMaster reference palette
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

// ── Visual-only field wrapper ─────────────────────────────────────────────────
function Field({ label, icon: Icon, children, span = false }) {
  const isRequired = label.includes("*");
  const displayLabel = label.replace("*", "").trim();

  return (
    <div className={`flex flex-col gap-1.5 ${span ? "md:col-span-2" : ""}`}>
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
        {Icon && <Icon size={13} className="text-slate-400/80 stroke-[2.2]" />}
        <span>
          {displayLabel}
          {isRequired && <span className="text-rose-500 ml-0.5 font-bold">*</span>}
        </span>
      </label>
      <div className="relative w-full transition-all duration-200">
        {children}
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 text-sm text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl outline-none focus:border-[#F4B400] focus:bg-white focus:ring-4 focus:ring-[#F4B400]/15 transition-all placeholder:text-slate-400 shadow-sm shadow-slate-100/50";

const selectCls =
  "w-full px-4 py-3 text-sm text-slate-700 bg-slate-50/60 border border-slate-200 rounded-xl outline-none focus:border-[#F4B400] focus:bg-white focus:ring-4 focus:ring-[#F4B400]/15 transition-all appearance-none cursor-pointer shadow-sm shadow-slate-100/50";

// ── Section divider ───────────────────────────────────────────────────────────
function SectionHeading({ label }) {
  return (
    <div className="md:col-span-2 flex items-center gap-4 pt-6 pb-2 first:pt-2">
      <div className="h-4 w-1 rounded-full" style={{ background: "#F4B400" }} />
      <span className="text-xs font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap" style={{ fontFamily: "Sora, sans-serif" }}>{label}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

// ── Select wrapper with chevron ───────────────────────────────────────────────
function SelectField({ children, ...props }) {
  return (
    <div className="relative w-full">
      <select {...props} className={selectCls}>{children}</select>
      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none stroke-[2.5]" />
    </div>
  );
}

// ── Main export — ALL logic UNTOUCHED ─────────────────────────────────────────
export default function AddOrder() {
  const role = localStorage.getItem("role");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // UI-only drawer state
  const [form, setForm] = useState({
    site: "",
    date: localStorage.getItem("selectedDate") || new Date().toISOString().split("T")[0],
    orderId: "",
    sku: "",
    product: "",
    quantity: "",
    costPrice: "",
    sellingPrice: "",
    ebayFee: "",
    adFee: "",
    deliveryCost: "",
    trackingNo: "",
    status: "Pending",
    courierScanned: "",
    notes: "",
  });

  useEffect(() => {
    ensureFonts();
  }, []);

  const handleSkuChange = async (e) => {
    const sku = e.target.value;
    if (!sku.trim()) {
      setForm((prev) => ({
        ...prev,
        sku: "",
        product: "",
        costPrice: "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      sku,
    }));



    try {
      const res = await apiFetch(
        `/api/stock/sku/${sku}`
      );

      if (!res.ok) {
        setForm((prev) => ({
          ...prev,
          sku,
          product: "",
          costPrice: "",
        }));
        return;
      }

      const stock = await res.json();

      setForm((prev) => ({
        ...prev,
        sku,
        product: stock.product || "",
        costPrice: stock.price || "",
        sellingPrice: stock.price || "",
      }));
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "date") {
      localStorage.setItem("selectedDate", value);
    }
  };
  const totalRevenue =
    Number(form.quantity || 0) *
    Number(form.sellingPrice || 0);
  const employeeName  = localStorage.getItem("employeeName")  || "Employee";
  const employeeEmail = localStorage.getItem("employeeEmail") || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    if (!form.site || !form.date || !form.orderId || !form.sku || !form.quantity) {
      alert("Please fill Site, Date, Order ID, SKU and Quantity");
      setLoading(false);
      return;
    }

    const quantity     = Number(form.quantity);
    const costPrice    = Number(form.costPrice);
    const sellingPrice = Number(form.sellingPrice);
    const ebayFee      = Number(form.ebayFee);
    const adFee        = Number(form.adFee);
    const deliveryCost = Number(form.deliveryCost);
    const revenue      = quantity * sellingPrice;
    const totalCost    = quantity * costPrice + ebayFee + adFee + deliveryCost;
    const profit       = revenue - totalCost;
    const margin       = revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : 0;

    try {
      const response = await apiFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          site: form.site, date: form.date, orderId: form.orderId,
          employeeId: "EMP001", employeeName, employeeEmail,
          sku: form.sku, product: form.product,
          quantity, costPrice, sellingPrice,
          ebayFee, adFee, deliveryCost,
          revenue, profit, margin,
          trackingNo: form.trackingNo, status: form.status,
          courierScanned: form.courierScanned, notes: form.notes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Order Saved Successfully ✅");
        setForm({
          site: form.site, date: form.date,
          orderId: "", sku: "", product: "", quantity: "",
          costPrice: "", sellingPrice: "", ebayFee: "", adFee: "",
          deliveryCost: "", trackingNo: "", status: "Pending",
          courierScanned: "", notes: "",
        });
        setLoading(false);
      } else {
        alert(data.message);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to Save Order ❌");
      setLoading(false);
    }
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  const initials = employeeName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ background: "#F8FAFC", fontFamily: "Inter, ui-sans-serif, system-ui" }}
    >
      {/* Sidebar drawer (hamburger-triggered, not sticky) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 shadow-2xl anim-slide-in">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={17} />
            </button>
            {role === "admin" ? <Sidebar /> : <EmployeeSidebar />}
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-screen">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-20 flex items-center gap-4 px-5 md:px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-900/[0.05] transition border border-slate-900/[0.08] shrink-0"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 flex-1 max-w-xs transition-all focus-within:border-slate-200">
            <Search size={15} className="text-slate-400" />
            <input
              className="bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none w-full"
              placeholder="Search orders…"
              readOnly
            />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button className="relative p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-slate-500 hover:text-slate-700">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-white" style={{ background: "#F4B400" }} />
            </button>
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer select-none">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-bold shadow-sm"
                style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}
              >
                {initials}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-700 leading-tight">{employeeName}</span>
                <span className="text-[10px] text-slate-400 leading-none capitalize mt-0.5">{role || "Staff"}</span>
              </div>
              <ChevronDown size={14} className="text-slate-400 ml-1" />
            </div>
          </div>
        </header>

        {/* ── Page body ── */}
        <main className="flex-1 px-5 md:px-8 py-8 max-w-5xl w-full mx-auto">

          {/* Page title */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ background: "rgba(244,180,0,0.12)", border: "1px solid rgba(244,180,0,0.28)" }}
                >
                  <ShoppingBag size={18} style={{ color: "#B45F06" }} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>Manual Entry</h1>
              </div>
              <p className="text-slate-400 text-xs ml-13">
                Logged in as <span className="font-semibold text-slate-600">{employeeName}</span>
              </p>
            </div>
          </div>

          {/* ── Form card ── */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl w-full border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden"
          >
            {/* Form header strip */}
            <div className="flex items-center justify-between px-8 py-5 bg-slate-50/50 border-b border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-800">New Order Details</p>
                <p className="text-xs text-slate-400 mt-0.5">Please provide precision data metrics</p>
              </div>
              <span
                className="text-[11px] font-bold px-3 py-1 rounded-lg tracking-wider uppercase"
                style={{ background: "rgba(244,180,0,0.12)", color: "#B45F06", border: "1px solid rgba(244,180,0,0.3)" }}
              >
                Draft Mode
              </span>
            </div>

            <div className="px-8 py-6 grid md:grid-cols-2 gap-x-6 gap-y-5">

              {/* ── Order Info ── */}
              <SectionHeading label="Order Info" />

              <Field label="Site *" icon={Store}>
                <SelectField name="site" value={form.site} onChange={handleChange}>
                  <option value="">Select Site</option>
                  <option value="TPS">TPS</option>
                  <option value="Smartzone">Smartzone</option>
                  <option value="Veluntra">Veluntra</option>
                  <option value="Amazon">Amazon</option>
                  <option value="TikTok">TikTok penkraft</option>
                  <option value="Shopify">Shopify</option>
                  <option value="Backmarket">Backmarket</option>
                </SelectField>
              </Field>

              <Field label="Date *" icon={Calendar}>
                <input type="date" name="date" value={form.date} onChange={handleChange} className={inputCls} />
              </Field>

              <Field label="Order ID *" icon={Hash}>
                <input type="text" name="orderId" placeholder="e.g. EB-00123" value={form.orderId} onChange={handleChange} className={inputCls} />
              </Field>

              <Field label="Employee" icon={User}>
                <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50/40 border border-slate-200 rounded-xl shadow-sm shadow-slate-100/50">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
                  >
                    {initials}
                  </div>
                  <span className="text-sm text-slate-600 font-semibold">{employeeName}</span>
                </div>
              </Field>

              {/* ── Product Info ── */}
              <SectionHeading label="Product Info" />

              <Field label="SKU *" icon={Tag}>

                <input
                  type="text"
                  name="sku"
                  placeholder="e.g. SKU-4821"
                  value={form.sku}
                  onChange={handleSkuChange}
                  className={inputCls}
                />
              </Field>
              <Field label="Product" icon={Package}>
                <input
                  type="text"
                  value={form.product || ""}
                  readOnly
                  className={`${inputCls} bg-slate-100`}
                />
              </Field>

              <Field label="Quantity *" icon={Package}>
                <input type="number" name="quantity" placeholder="0" value={form.quantity} onChange={handleChange} className={inputCls} />
              </Field>

              {/* ── Financials ── */}
              <SectionHeading label="Financials (£)" />

              <Field label="Unit Cost / LP (£)" icon={DollarSign}>
                <input type="number" step="0.01" name="costPrice" placeholder="0.00" value={form.costPrice} onChange={handleChange} className={inputCls} />
              </Field>

              <Field label="Sales Amount (£)" icon={DollarSign}>
                <input type="number" step="0.01" name="sellingPrice" placeholder="0.00" value={form.sellingPrice} onChange={handleChange} className={inputCls} />
              </Field>
              <Field label="Total Revenue (£)" icon={DollarSign}>
                <input
                  type="number"
                  value={totalRevenue.toFixed(2)}
                  readOnly
                  className={`${inputCls} bg-slate-100 font-bold`}
                />
              </Field>

              <Field label="eBay Transaction Fee (£)" icon={BarChart2}>
                <input type="number" step="0.01" name="ebayFee" placeholder="0.00" value={form.ebayFee} onChange={handleChange} className={inputCls} />
              </Field>

              <Field label="Ad Fee (£)" icon={BarChart2}>
                <input type="number" step="0.01" name="adFee" placeholder="0.00" value={form.adFee} onChange={handleChange} className={inputCls} />
              </Field>

              <Field label="Shipping Cost (£)" icon={Truck}>
                <input type="number" step="0.01" name="deliveryCost" placeholder="0.00" value={form.deliveryCost} onChange={handleChange} className={inputCls} />
              </Field>

              {/* ── Shipping & Status ── */}
              <SectionHeading label="Shipping & Status" />

              <Field label="Tracking Number" icon={Truck}>
                <input type="text" name="trackingNo" placeholder="e.g. JD0001234567890" value={form.trackingNo} onChange={handleChange} className={inputCls} />
              </Field>

              <Field label="Order Status" icon={CheckCircle2}>
                <SelectField name="status" value={form.status} onChange={handleChange}>
                  <option value="Pending">Pending</option>
                  <option value="Hold">Hold</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Returned">Returned</option>
                  <option value="Cancelled">Cancelled</option>
                </SelectField>
              </Field>

              <Field label="Courier Scanned?" icon={ScanLine}>
                <SelectField name="courierScanned" value={form.courierScanned} onChange={handleChange}>
                  <option value="">Select…</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </SelectField>
              </Field>

              {/* ── Notes ── */}
              <SectionHeading label="Notes" />

              <Field label="Additional Notes" icon={FileText} span>
                <textarea
                  name="notes"
                  placeholder="Any extra details about this order…"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </Field>

              {/* ── Submit ── */}
              <div className="md:col-span-2 pt-4 pb-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold tracking-wide transform transition-all duration-200"
                  style={
                    loading
                      ? { background: "#F1F5F9", color: "#94A3B8", border: "1px solid #E2E8F0", cursor: "not-allowed" }
                      : {
                          background: "linear-gradient(135deg, #F4B400, #F59E0B)",
                          color: "#0F172A",
                          boxShadow: "0 10px 24px -6px rgba(244,180,0,0.4)",
                        }
                  }
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = "0 12px 30px -6px rgba(244,180,0,0.55)"; }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.boxShadow = "0 10px 24px -6px rgba(244,180,0,0.4)"; }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving Order…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} className="stroke-[2.5]" />
                      Save Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .anim-slide-in { animation: slideIn 0.28s cubic-bezier(0.22,1,0.36,1); }
        @media (prefers-reduced-motion: reduce) { .anim-slide-in { animation: none !important; } }
      `}</style>
    </div>
  );
}
