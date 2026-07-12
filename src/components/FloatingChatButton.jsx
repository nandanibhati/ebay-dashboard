import { MessageCircle, X } from "lucide-react";
import useDraggablePosition from "../hooks/useDraggablePosition";

const BUTTON_SIZE = { width: 56, height: 56 };

export default function FloatingChatButton({
  isOpen,
  onClick,
  unreadCount,
}) {
  const { position, handlePointerDown, handlePointerMove, handlePointerUp } = useDraggablePosition(
    "chatBubblePosition",
    () => ({ left: window.innerWidth - 56 - 24, top: window.innerHeight - 56 - 24 }),
    BUTTON_SIZE
  );

  if (!position) return null;

  return (
    <div
      className="fixed z-[9999] flex flex-col items-end gap-2"
      style={{ left: position.left, top: position.top }}
    >
      {/* Toast Preview */}
      {!isOpen && unreadCount > 0 && (
        <div className="animate-slide-up bg-white border border-slate-100 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 max-w-[240px]">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)" }}
          >
            <MessageCircle size={15} style={{ color: "#0F172A" }} />
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

      {/* Floating Button — drag anywhere on screen, click (no drag) to open */}
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => handlePointerUp(onClick)}
        className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-colors duration-300 active:scale-95 touch-none cursor-grab active:cursor-grabbing ${
          isOpen ? "bg-slate-800 hover:bg-slate-700" : ""
        }`}
        style={!isOpen ? { background: "linear-gradient(135deg, #F4B400, #F59E0B)" } : {}}
      >
        {/* Pulse */}
        {!isOpen && unreadCount > 0 && (
          <>
            <span className="absolute inset-0 rounded-full bg-[#F4B400] opacity-30 animate-ping" />
            <span
              className="absolute inset-0 rounded-full bg-[#F59E0B] opacity-20 animate-ping"
              style={{ animationDelay: "0.3s" }}
            />
          </>
        )}

        {isOpen ? (
          <X size={22} className="text-white" />
        ) : (
          <MessageCircle size={22} style={{ color: "#0F172A" }} />
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
