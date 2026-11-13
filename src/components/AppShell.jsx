import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import ManagerSidebar from "./ManagerSidebar";
import EmployeeSidebar from "./EmployeeSidebar";

// Pages that lay out their own permanent sidebar.
const OWN_LAYOUT = ["/chat"];

// On laptop/desktop widths (lg+) the role's sidebar stays open on the left
// and the page sits beside it. Below lg nothing changes: pages keep their
// own hamburger-triggered drawer (whose button is lg:hidden).
export default function AppShell({ children }) {
  const { pathname } = useLocation();
  if (OWN_LAYOUT.includes(pathname)) return children;

  const role = localStorage.getItem("role");
  const RoleSidebar = role === "admin" ? Sidebar : role === "manager" ? ManagerSidebar : EmployeeSidebar;

  return (
    <>
      {/* The sidebars position themselves (fixed, w-72); this hides the
          permanent copy on small screens and lifts it above page
          backgrounds (some pages paint full-screen decorative layers),
          while staying under modals and drawers (z-50). */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-72 z-40">
        <RoleSidebar />
      </div>
      <div className="lg:pl-72">{children}</div>
    </>
  );
}
