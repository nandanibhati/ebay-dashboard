import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader2, ShoppingBag, TrendingUp, BarChart2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://ebay-dashboard-z7h2.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("employeeName", data.name);
        localStorage.setItem("employeeEmail", data.email);

        if (data.role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/employee-dashboard");
        }
      } else {
        alert(data.message);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      alert("Login Failed");
      setLoading(false);
    }
  };

  // ── UI only ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f6fa] flex">

      {/* ── Left panel — branding ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(140deg, #7c3aed 0%, #4f46e5 55%, #0ea5e9 100%)",
        }}
      >
        {/* decorative blobs */}
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-10 -right-20 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <ShoppingBag size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">eBay Analytics</span>
        </div>

        {/* Centre copy */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Your sales,<br />at a glance.
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Track orders, profit margins, employee performance and attendance — all in one clean dashboard.
          </p>

          {/* mini stat pills */}
          <div className="flex flex-col gap-3 pt-2">
            {[
              { icon: TrendingUp, label: "Revenue tracking", sub: "Real-time" },
              { icon: BarChart2,  label: "Profit & margin",  sub: "Per order" },
              { icon: ShoppingBag, label: "Order management", sub: "Multi-site" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-white/50 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-white/30 text-xs">© 2024 eBay Analytics. All rights reserved.</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
              <ShoppingBag size={16} className="text-violet-600" />
            </div>
            <span className="font-bold text-gray-800 text-base">eBay Analytics</span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sign in</h1>
            <p className="text-gray-400 text-sm mt-1">Enter your credentials to continue</p>
          </div>

          {/* Form */}
          <div className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full pl-10 pr-4 py-3 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full pl-10 pr-4 py-3 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-150 mt-2 ${
                loading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-500 active:scale-[0.99] text-white"
              }`}
              style={!loading ? { boxShadow: "0 4px 18px 0 rgba(124,58,237,0.30)" } : {}}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-violet-600 font-semibold hover:text-violet-500 transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
