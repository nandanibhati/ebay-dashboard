import { MessageCircle, X } from "lucide-react";

export default function FloatingChatButton({
  isOpen,
  onClick,
  unreadCount,
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
      {/* Toast Preview */}
      {!isOpen && unreadCount > 0 && (
        <div className="animate-slide-up bg-white border border-slate-100 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 max-w-[240px]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <MessageCircle size={15} className="text-white" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800">
              New message
            </p>

            <p className="text-[11px] text-slate-400">
              Tap to open chat
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={onClick}
        className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-95 ${
          isOpen
            ? "bg-slate-800 hover:bg-slate-700"
            : "bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
        }`}
      >
        {/* Pulse */}
        {!isOpen && unreadCount > 0 && (
          <>
            <span className="absolute inset-0 rounded-full bg-violet-500 opacity-30 animate-ping" />
            <span
              className="absolute inset-0 rounded-full bg-violet-400 opacity-20 animate-ping"
              style={{ animationDelay: "0.3s" }}
            />
          </>
        )}

        {isOpen ? (
          <X size={22} className="text-white" />
        ) : (
          <MessageCircle size={22} className="text-white" />
        )}

        {/* Badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}