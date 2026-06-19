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
  return (
    <div className={`flex flex-col gap-1.5 ${span ? "md:col-span-2" : ""}`}>
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
        {Icon && <Icon size={11} className="text-gray-400" />}
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-gray-400";

const selectCls =
  "w-full px-4 py-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all appearance-none cursor-pointer";

// ── Section divider ───────────────────────────────────────────────────────────
function SectionHeading({ label }) {
  return (
    <div className="md:col-span-2 flex items-center gap-3 pt-2">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

// ── Select wrapper with chevron ───────────────────────────────────────────────
function SelectField({ children, ...props }) {
  return (
    <div className="relative">
      <select {...props} className={selectCls}>{children}</select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "date") {
      localStorage.setItem("selectedDate", value);
    }
  };

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
    <div className="flex min-h-screen bg-[#f5f6fa]">
      {role === "admin" ? <Sidebar /> : <EmployeeSidebar />}

      <div className="flex-1 ml-64 flex flex-col min-h-screen">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-10 flex items-center gap-4 px-8 py-4 bg-white/70 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 flex-1 max-w-xs">
            <Search size={14} className="text-gray-400" />
            <input
              className="bg-transparent text-sm text-gray-500 placeholder:text-gray-400 outline-none w-full"
              placeholder="Search orders…"
              readOnly
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell size={18} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer select-none">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                {initials}
              </div>
              <span className="text-sm text-gray-700 font-medium">{employeeName}</span>
              <ChevronDown size={13} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* ── Page body ── */}
        <main className="flex-1 px-8 py-8">

          {/* Page title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                <ShoppingBag size={17} className="text-violet-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manual Entry</h1>
            </div>
            <p className="text-gray-400 text-sm ml-12">
              Logged in as <span className="font-semibold text-gray-600">{employeeName}</span>
            </p>
          </div>

          {/* ── Form card ── */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl w-full max-w-5xl"
            style={{ boxShadow: "0 2px 24px 0 rgba(0,0,0,0.07), 0 1px 4px 0 rgba(0,0,0,0.04)" }}
          >
            {/* Form header strip */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-900">New Order</p>
                <p className="text-xs text-gray-400 mt-0.5">All fields marked * are required</p>
              </div>
              <span className="text-xs bg-violet-50 text-violet-600 border border-violet-100 font-semibold px-3 py-1 rounded-full">
                Draft
              </span>
            </div>

            <div className="px-8 py-7 grid md:grid-cols-2 gap-5">

              {/* ── Order Info ── */}
              <SectionHeading label="Order Info" />

              <Field label="Site *" icon={Store}>
                <SelectField name="site" value={form.site} onChange={handleChange}>
                  <option value="">Select Site</option>
                  <option value="TPS">TPS</option>
                  <option value="Smartzone">Smartzone</option>
                  <option value="Veluntra">Veluntra</option>
                  <option value="Amazon">Amazon</option>
                  <option value="TikTok">TikTok</option>
                </SelectField>
              </Field>

              <Field label="Date *" icon={Calendar}>
                <input type="date" name="date" value={form.date} onChange={handleChange} className={inputCls} />
              </Field>

              <Field label="Order ID *" icon={Hash}>
                <input type="text" name="orderId" placeholder="e.g. EB-00123" value={form.orderId} onChange={handleChange} className={inputCls} />
              </Field>

              <Field label="Employee" icon={User}>
                <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{employeeName}</span>
                </div>
              </Field>

              {/* ── Product Info ── */}
              <SectionHeading label="Product Info" />

              <Field label="SKU *" icon={Tag}>
                <input type="text" name="sku" placeholder="e.g. SKU-4821" value={form.sku} onChange={handleChange} className={inputCls} />
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
              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-150 ${
                    loading
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-violet-600 hover:bg-violet-500 active:scale-[0.99] text-white"
                  }`}
                  style={!loading ? { boxShadow: "0 4px 18px 0 rgba(124,58,237,0.30)" } : {}}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving Order…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
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
