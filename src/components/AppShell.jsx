import { useState } from "react";
import { useLocation } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Sidebar from "./Sidebar";
import ManagerSidebar from "./ManagerSidebar";
import EmployeeSidebar from "./EmployeeSidebar";

// Pages that lay out their own permanent sidebar.
const OWN_LAYOUT = ["/chat"];

// Remembered per browser, so each person keeps their own choice.
const HIDDEN_KEY = "sidebarHidden";

function readHidden() {
  try {
    return localStorage.getItem(HIDDEN_KEY) === "1";
  } catch {
    return false;
  }
}

// On laptop/desktop widths (lg+) the role's sidebar stays open on the left
// and the page sits beside it — unless the user hides it with the button
// on its edge, which leaves a slim rail with a button to bring it back.
// Below lg nothing changes: pages keep their own hamburger-triggered
// drawer (whose button is lg:hidden).
export default function AppShell({ children }) {
  const { pathname } = useLocation();
  const [hidden, setHidden] = useState(readHidden);

  if (OWN_LAYOUT.includes(pathname)) return children;

  const role = localStorage.getItem("role");
  const RoleSidebar = role === "admin" ? Sidebar : role === "manager" ? ManagerSidebar : EmployeeSidebar;

  const toggle = () => {
    const next = !hidden;
    setHidden(next);
    try {
      localStorage.setItem(HIDDEN_KEY, next ? "1" : "0");
    } catch {
      // private mode etc. — the choice just isn't remembered
    }
  };

  return (
    <>
      {/* The sidebars position themselves (fixed, w-72); this hides the
          permanent copy on small screens and lifts it above page
          backgrounds (some pages paint full-screen decorative layers),
          while staying under modals and drawers (z-50). */}
      {hidden ? (
        <div className="hidden lg:flex fixed inset-y-0 left-0 w-12 z-40 flex-col items-center pt-4 bg-[#0F172A] border-r border-white/5">
          <button
            type="button"
            onClick={toggle}
            title="Show menu"
            aria-label="Show menu"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <PanelLeftOpen size={18} />
          </button>
        </div>
      ) : (
        <div className="hidden lg:block fixed inset-y-0 left-0 w-72 z-40">
          <RoleSidebar />
          <button
            type="button"
            onClick={toggle}
            title="Hide menu"
            aria-label="Hide menu"
            className="absolute top-5 -right-3.5 w-7 h-7 rounded-full flex items-center justify-center bg-white text-slate-600 border border-slate-200 shadow-md hover:text-slate-900 hover:bg-slate-50 transition"
          >
            <PanelLeftClose size={14} />
          </button>
        </div>
      )}
      <div className={hidden ? "lg:pl-12" : "lg:pl-72"}>{children}</div>
    </>
  );
}
