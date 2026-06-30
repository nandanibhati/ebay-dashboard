import { X } from "lucide-react";
import { useEffect } from "react";

export default function NotificationToast({
  toast,
  onClose,
  onClick,
}) {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[9998] animate-slide-up">
      <div
        onClick={onClick}
        className="cursor-pointer bg-white/90 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-2xl px-4 py-3.5 flex items-start gap-3 w-[300px] hover:shadow-violet-300/20 transition-all"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow">
          <span className="text-white text-sm font-bold">
            {toast.senderName?.charAt(0)?.toUpperCase()}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-800 truncate">
            {toast.senderName}
          </p>

          <p className="text-[11px] text-slate-500 truncate mt-0.5">
            {toast.message
              ? toast.message
              : toast.image
              ? "📷 Image"
              : toast.file
              ? "📎 File"
              : "New message"}
          </p>
        </div>

        {/* Close */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="flex-shrink-0 w-5 h-5 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
        >
          <X size={12} className="text-slate-400" />
        </button>
      </div>
    </div>
  );
}