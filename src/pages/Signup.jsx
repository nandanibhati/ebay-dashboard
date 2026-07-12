import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, Loader2, ShoppingBag, Users, ClipboardList, Package, Sparkles } from "lucide-react";
import { apiFetch } from "../api";

/* Design tokens - matches Login.jsx
   Gold: #F4B400  Blue: #2563EB  Emerald: #22C55E
   Dark navy: #0F172A / #0B1220
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

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    ensureFonts();
  }, []);

  const handleSignup = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(
        "/api/auth/signup",
        {
          method: "POST",
          body: JSON.stringify({
            name,
            email,
            password,
            role: "employee",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        navigate("/");
      } else {
        alert(data.message);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      alert("Signup Failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>

      {/* ── Left panel — branding, matches Login ── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0B1220 0%, #0F172A 60%, #111827 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="absolute -top-32 -left-24 w-[32rem] h-[32rem] rounded-full blur-[110px] anim-drift-a"
          style={{ background: "radial-gradient(circle, rgba(244,180,0,0.22), transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-8rem] right-[-6rem] w-[28rem] h-[28rem] rounded-full blur-[110px] anim-drift-b"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.24), transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-[90px] anim-drift-c"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.14), transparent 70%)" }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 anim-fade-up" style={{ animationDelay: "0ms" }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_8px_20px_rgba(244,180,0,0.35)]"
            style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)" }}
          >
            <ShoppingBag size={19} className="text-[#0F172A]" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>
            eBay Analytics
          </span>
        </div>

        {/* Centre copy + feature list */}
        <div className="relative z-10 grid gap-10">
          <div className="space-y-5 anim-fade-up" style={{ animationDelay: "80ms" }}>
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
              style={{ background: "rgba(244,180,0,0.12)", border: "1px solid rgba(244,180,0,0.3)", color: "#F4B400" }}
            >
              <Sparkles size={11} /> Join the team
            </span>
            <h2 className="text-[2.6rem] font-bold text-white leading-[1.1] tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>
              Create your<br />account.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Track orders, manage stock, and stay on top of tasks — all in one place with your team.
            </p>
          </div>

          <div className="relative anim-fade-up" style={{ animationDelay: "160ms" }}>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: ClipboardList, label: "Tasks", value: "Assigned", color: "#F4B400" },
                { icon: Package, label: "Stock", value: "Live", color: "#2563EB" },
                { icon: Users, label: "Team", value: "Connected", color: "#22C55E" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="relative rounded-2xl p-4 border border-white/10 bg-white/[0.04] backdrop-blur-xl anim-float-card overflow-hidden"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <div
                    className="absolute -top-6 -right-6 w-16 h-16 rounded-full blur-2xl opacity-40"
                    style={{ background: s.color }}
                  />
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 relative"
                    style={{ background: `${s.color}22`, border: `1px solid ${s.color}44` }}
                  >
                    <s.icon size={14} style={{ color: s.color }} />
                  </div>
                  <p className="text-white text-sm font-bold tracking-tight relative" style={{ fontFamily: "Sora, sans-serif" }}>
                    {s.value}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5 relative">{s.label}</p>
                </div>
              ))}
            </div>
            <div
              className="absolute -bottom-4 left-0 right-0 h-px opacity-40"
              style={{ background: "linear-gradient(90deg, transparent, #F4B400, transparent)" }}
            />
          </div>
        </div>

        <p className="relative z-10 text-slate-600 text-xs anim-fade-up" style={{ animationDelay: "240ms" }}>
          © 2026 eBay Analytics. All rights reserved.
        </p>
      </div>

      {/* ── Right panel — form, matches Login ── */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden"
        style={{ background: "#F8FAFC" }}
      >
        <div
          className="absolute inset-0 opacity-[0.5] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 85%)",
          }}
        />
        <div
          className="absolute -top-24 right-[-6rem] w-96 h-96 rounded-full blur-[100px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(244,180,0,0.10), transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-6rem] left-[-4rem] w-80 h-80 rounded-full blur-[100px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)" }}
        />

        <div className="w-full max-w-sm relative z-10 anim-fade-up" style={{ animationDelay: "60ms" }}>
          <div className="rounded-[28px] border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_30px_70px_-20px_rgba(30,41,59,0.25)] p-8 sm:p-9 space-y-7">
            {/* Mobile logo */}
            <div className="flex lg:hidden items-center justify-center gap-2 mb-1">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)" }}
              >
                <ShoppingBag size={16} className="text-[#0F172A]" />
              </div>
              <span className="font-bold text-slate-800 text-base" style={{ fontFamily: "Sora, sans-serif" }}>eBay Analytics</span>
            </div>

            {/* Heading */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>Create account</h1>
              <p className="text-slate-400 text-sm mt-1">Sign up to get started</p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative group">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors group-focus-within:text-[#B45F06]" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                    className="w-full pl-10 pr-4 py-3 text-sm text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl outline-none focus:border-[#F4B400] focus:bg-white focus:ring-4 focus:ring-[#F4B400]/12 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                <div className="relative group">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors group-focus-within:text-[#B45F06]" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                    className="w-full pl-10 pr-4 py-3 text-sm text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl outline-none focus:border-[#F4B400] focus:bg-white focus:ring-4 focus:ring-[#F4B400]/12 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors group-focus-within:text-[#B45F06]" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                    className="w-full pl-10 pr-4 py-3 text-sm text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl outline-none focus:border-[#F4B400] focus:bg-white focus:ring-4 focus:ring-[#F4B400]/12 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-3 text-[11px] text-slate-500 font-medium leading-normal">
                New accounts get regular employee access by default.
              </div>

              {/* Submit */}
              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 mt-2 relative overflow-hidden group"
                style={
                  loading
                    ? { background: "#E2E8F0", color: "#94A3B8", cursor: "not-allowed" }
                    : {
                        background: "linear-gradient(135deg, #F4B400, #F59E0B)",
                        color: "#0F172A",
                        boxShadow: "0 10px 26px -6px rgba(244,180,0,0.45)",
                      }
                }
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = "0 14px 32px -6px rgba(244,180,0,0.6)"; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.boxShadow = "0 10px 26px -6px rgba(244,180,0,0.45)"; }}
              >
                {!loading && <span className="absolute inset-0 anim-shine pointer-events-none" />}
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>

            {/* Sign in link */}
            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/" className="font-semibold transition-colors" style={{ color: "#B45F06" }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .anim-fade-up { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }

        @keyframes driftA { 0%,100% { transform: translate(0,0); } 50% { transform: translate(24px,18px); } }
        @keyframes driftB { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-22px,20px); } }
        @keyframes driftC { 0%,100% { transform: translate(0,0); } 50% { transform: translate(16px,-16px); } }
        .anim-drift-a { animation: driftA 12s ease-in-out infinite; }
        .anim-drift-b { animation: driftB 15s ease-in-out infinite; }
        .anim-drift-c { animation: driftC 18s ease-in-out infinite; }

        @keyframes floatCard { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .anim-float-card { animation: floatCard 4.5s ease-in-out infinite; }

        @keyframes shine { 0% { transform: translateX(-120%) skewX(-15deg); } 60%,100% { transform: translateX(220%) skewX(-15deg); } }
        .anim-shine { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent); width: 40%; animation: shine 2.8s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .anim-fade-up, .anim-drift-a, .anim-drift-b, .anim-drift-c, .anim-float-card, .anim-shine {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
