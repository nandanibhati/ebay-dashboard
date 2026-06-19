import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Package,
  Percent,
  Award,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
  Calendar,
  User,
  ArrowUpRight
} from "lucide-react";

export default function Analytics() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("https://ebay-dashboard-z7h2.onrender.com/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.log(err));
  }, []);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.revenue || 0),
    0
  );

  const totalProfit = orders.reduce(
    (sum, order) => sum + Number(order.profit || 0),
    0
  );

  const highestMargin =
    orders.length > 0
      ? Math.max(...orders.map((o) => Number(o.margin || 0))).toFixed(2)
      : 0;

  const topProduct =
    orders.length > 0
      ? orders.reduce((a, b) =>
          Number(a.quantity || 0) > Number(b.quantity || 0) ? a : b
        ).sku
      : "-";

  const employeeCounts = {};

  orders.forEach((order) => {
    const name = order.employeeName || "Unknown";
    employeeCounts[name] = (employeeCounts[name] || 0) + 1;
  });

  const topEmployee =
    Object.keys(employeeCounts).length > 0
      ? Object.keys(employeeCounts).reduce((a, b) =>
          employeeCounts[a] > employeeCounts[b] ? a : b
        )
      : "-";

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <div className="flex-1 ml-72 p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full">
        
        {/* Analytics Hero Engine Banner */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-indigo-600/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 pointer-events-none">
            <Layers size={320} />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Business Analytics Engine
            </h1>
            <p className="mt-1.5 text-violet-100/90 text-sm max-w-xl font-medium">
              Real-time transactional log processing matrix. Review aggregate velocity parameters, micro-margins, and global performance variables.
            </p>
          </div>
        </div>

        {/* Analytics High-Density Balanced Matrix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          
          {/* Card 1: Total Orders */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total Orders</p>
              <h2 className="text-2xl font-black mt-1 text-slate-900 tracking-tight">{orders.length}</h2>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-600">
              <ShoppingBag size={18} className="stroke-[2.5]" />
            </div>
          </div>

          {/* Card 2: Top Product */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Top Product SKU</p>
              <h2 className="text-lg font-black mt-2 text-slate-900 tracking-tight truncate max-w-[110px]" title={topProduct}>
                {topProduct}
              </h2>
            </div>
            <div className="bg-violet-50 border border-violet-100 p-3 rounded-xl text-violet-600">
              <Package size={18} className="stroke-[2.5]" />
            </div>
          </div>

          {/* Card 3: Highest Margin */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Peak Margin</p>
              <h2 className="text-2xl font-black mt-1 text-emerald-600 tracking-tight">{highestMargin}%</h2>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-600">
              <Percent size={18} className="stroke-[2.5]" />
            </div>
          </div>

          {/* Card 4: Top Employee */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Top Employee</p>
              <h2 className="text-base font-black mt-2 text-slate-900 tracking-tight truncate max-w-[110px]" title={topEmployee}>
                {topEmployee}
              </h2>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-amber-600">
              <Award size={18} className="stroke-[2.5]" />
            </div>
          </div>

          {/* Card 5: Total Revenue */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total Gross Revenue</p>
              <h2 className="text-2xl font-black mt-1 text-slate-900 tracking-tight">£{totalRevenue.toFixed(2)}</h2>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-indigo-600">
              <DollarSign size={18} className="stroke-[2.5]" />
            </div>
          </div>

          {/* Card 6: Total Profit */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm shadow-slate-100/50 flex justify-between items-center transition-all hover:shadow-md">
            <div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Net Yield Profit</p>
              <h2 className="text-2xl font-black mt-1 text-violet-600 tracking-tight">£{totalProfit.toFixed(2)}</h2>
            </div>
            <div className="bg-violet-50 border border-violet-100 p-3 rounded-xl text-violet-600">
              <TrendingUp size={18} className="stroke-[2.5]" />
            </div>
          </div>

        </div>

        {/* Master Transaction Log Metrics View */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/20 overflow-hidden w-full flex flex-col"
        >
          
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Latest Orders Analysis Pipeline</h2>
              <p className="text-xs text-slate-400 mt-0.5">Isolated runtime stack analyzing the last 10 transaction sequences generated inside the node ecosystem.</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 text-xs font-bold shadow-sm">
              <Calendar size={13} className="text-slate-400" />
              <span>Realtime Continuous Log Stream</span>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">System Transaction ID</th>
                  <th className="px-4 py-4">Processor Operator Node</th>
                  <th className="px-4 py-4 text-right">Gross Revenue</th>
                  <th className="px-4 py-4 text-right">Net Profit Pipeline</th>
                  <th className="px-6 py-4 text-center">Calculated Margin</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-16 text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-2 justify-center">
                        <Package size={32} className="text-slate-300 stroke-[1.5]" />
                        <span>No historical transactions found within backend cache blocks.</span>
                      </div>
                    </td>
                  </tr>
                )}

                {orders
                  .slice(-10)
                  .reverse()
                  .map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/80 transition-all group">
                      
                      {/* Order Identification Reference */}
                      <td className="px-6 py-4 font-mono font-bold text-xs text-slate-500 group-hover:text-violet-600 transition-colors">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-violet-500 transition-colors" />
                          {order.orderId || "UNKN-REF"}
                        </div>
                      </td>

                      {/* Associated Employee Vector */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200/60 text-slate-600 flex items-center justify-center font-bold text-[11px]">
                            {order.employeeName?.charAt(0).toUpperCase() || <User size={12} />}
                          </div>
                          <span className="font-bold text-slate-800 text-xs">
                            {order.employeeName || "System Automated"}
                          </span>
                        </div>
                      </td>

                      {/* Calculated Financial Metrics */}
                      <td className="px-4 py-4 text-right whitespace-nowrap font-semibold text-slate-900">
                        £{Number(order.revenue || 0).toFixed(2)}
                      </td>

                      <td className="px-4 py-4 text-right whitespace-nowrap font-bold text-emerald-600 bg-emerald-50/10">
                        <div className="flex items-center justify-end gap-1">
                          <ArrowUpRight size={12} className="opacity-70" />
                          <span>£{Number(order.profit || 0).toFixed(2)}</span>
                        </div>
                      </td>

                      {/* Performance Margin Output Vector */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                          Number(order.margin || 0) >= 30
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                            : Number(order.margin || 0) >= 15
                            ? "bg-blue-50 border-blue-100 text-blue-700"
                            : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}>
                          {Number(order.margin || 0).toFixed(2)}%
                        </span>
                      </td>

                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

        </motion.div>

      </div>
    </div>
  );
}