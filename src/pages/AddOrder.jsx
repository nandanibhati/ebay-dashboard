import Sidebar from "../components/Sidebar";
import EmployeeSidebar from "../components/EmployeeSidebar";
import { useState } from "react";
import {
  ShoppingBag, Calendar, Hash, User, Package, Tag,
  DollarSign, Truck, FileText, ChevronDown, Loader2,
  CheckCircle2, Store, BarChart2, ScanLine, Bell, Search,
} from "lucide-react";

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
  "w-full px-4 py-3 text-sm text-slate-800 bg-slate-50/60 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:text-slate-400 shadow-sm shadow-slate-100/50";

const selectCls =
  "w-full px-4 py-3 text-sm text-slate-700 bg-slate-50/60 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 transition-all appearance-none cursor-pointer shadow-sm shadow-slate-100/50";

// ── Section divider ───────────────────────────────────────────────────────────
function SectionHeading({ label }) {
  return (
    <div className="md:col-span-2 flex items-center gap-4 pt-6 pb-2 first:pt-2">
      <div className="h-4 w-1 bg-violet-500 rounded-full" />
      <span className="text-xs font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap">{label}</span>
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
    const res = await fetch(
      `https://ebay-dashboard-z7h2.onrender.com/api/stock/sku/${sku}`
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
      const response = await fetch("https://ebay-dashboard-z7h2.onrender.com/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className="flex min-h-screen bg-[#f8fafc]">
      {role === "admin" ? <Sidebar /> : <EmployeeSidebar />}

      <div className="flex-1 ml-64 flex flex-col min-h-screen">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-10 flex items-center gap-4 px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100">
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
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-white" />
            </button>
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer select-none">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white text-[11px] font-bold shadow-sm shadow-violet-200">
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
        <main className="flex-1 px-8 py-8 max-w-5xl w-full mx-auto">

          {/* Page title */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shadow-sm shadow-violet-100">
                  <ShoppingBag size={18} className="text-violet-600" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manual Entry</h1>
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
              <span className="text-[11px] bg-violet-50 text-violet-600 border border-violet-100/70 font-bold px-3 py-1 rounded-lg tracking-wider uppercase">
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
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
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
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold tracking-wide transform transition-all duration-200 ${
                    loading
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.99] text-white shadow-lg shadow-violet-600/20 hover:shadow-xl hover:shadow-violet-600/30"
                  }`}
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
    </div>
  );
}