import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  UserPlus, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck,
  Building2 
} from "lucide-react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const response = await fetch(
        "https://ebay-dashboard-z7h2.onrender.com/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
        alert("Account Created Successfully ✅");
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Signup Failed ❌");
    }
  };

  // Shared Core Token Styles
  const labelCls = "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5";
  const inputCls = "w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/60 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 transition-all text-slate-800 placeholder:text-slate-400 font-medium";
  const iconCls = "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.5]";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decorative Grid Network Background Array Accent */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl shadow-slate-200/50 w-full max-w-[460px] overflow-hidden flex flex-col z-10"
      >
        
        {/* Module Decorative Identity Card Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4 pointer-events-none">
            <UserPlus size={160} />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-inner">
              <Building2 size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Create Operator Profile</h1>
              <p className="text-[11px] text-violet-100/80 font-medium mt-0.5">
                Register a new structural workspace node to track active logistics pipelines
              </p>
            </div>
          </div>
        </div>

        {/* Master Identity Form Context Container */}
        <div className="p-6 flex flex-col gap-4">
          
          {/* Node Identity Registration Segment */}
          <div>
            <label className={labelCls}>Full Professional Name</label>
            <div className="relative">
              <User size={14} className={iconCls} />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Secure Routing Communication Node Endpoint Input */}
          <div>
            <label className={labelCls}>Corporate Email Vector</label>
            <div className="relative">
              <Mail size={14} className={iconCls} />
              <input
                type="email"
                placeholder="operator@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Security Signature Access Token String Token Ingestion */}
          <div>
            <label className={labelCls}>System Authorization Key</label>
            <div className="relative">
              <Lock size={14} className={iconCls} />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Default Security Assignment Context Notice Indicator */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-2.5">
            <ShieldCheck size={14} className="text-violet-500 shrink-0 stroke-[2.5]" />
            <span className="text-[10px] text-slate-500 font-semibold leading-normal">
              Identity profiles auto-assign to safe global <span className="font-mono text-violet-600 font-black bg-violet-50 px-1 py-0.5 rounded border border-violet-100 text-[9px]">EMPLOYEE_ROLE</span> parameters.
            </span>
          </div>

          {/* API Pipeline Execution Trigger Submit Key */}
          <button
            onClick={handleSignup}
            className="w-full mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-600/10 active:scale-[0.99] flex items-center justify-center gap-1.5 group"
          >
            <span>Initialize Authorization Registry</span>
            <ArrowRight size={13} className="stroke-[2.5] transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Subtext Inverse Redirection Link Navigation Route */}
          <div className="text-center mt-2 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
            Already have an active identity card?{" "}
            <Link
              to="/"
              className="text-violet-600 font-bold hover:text-indigo-600 transition-colors inline-flex items-center gap-0.5 group"
            >
              <span>Login to Station</span>
            </Link>
          </div>

        </div>

      </motion.div>
    </div>
  );
}