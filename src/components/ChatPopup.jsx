import { Minus, X, Hash } from "lucide-react";

import ChatSidebarWidget from "./ChatSidebarWidget";
import ChatMessages from "./ChatMessages";
import MessageInput from "./MessageInput";
import useDraggablePosition from "../hooks/useDraggablePosition";

const PANEL_SIZE = { width: 380, height: 620 };

export default function ChatPopup({
  isOpen,
  isMinimized,
  onMinimize,
  onClose,

  users,
  currentUser,

  selectedChat,
  setSelectedChat,

  messages,
  typingUser,

  replyMessage,
  setReplyMessage,

  onSend,
  onTyping,
  onStopTyping,
  onDelete,
}) {
  const { position, handlePointerDown, handlePointerMove, handlePointerUp } = useDraggablePosition(
    "chatPopupPosition",
    () => ({
      left: window.innerWidth - PANEL_SIZE.width - 24,
      top: window.innerHeight - PANEL_SIZE.height - 96,
    }),
    PANEL_SIZE
  );

  if (!isOpen || !position) return null;

  const isGroup =
    selectedChat?.type === "group";

  return (
    <div
      className="fixed z-[9998] transition-opacity duration-300"
      style={{ width: PANEL_SIZE.width, left: position.left, top: position.top }}
    >
      <div
        className="rounded-2xl overflow-hidden flex flex-col border border-white/10"
        style={{
          height: isMinimized ? "auto" : 620,
          background:
            "rgba(15,15,25,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter:
            "blur(24px)",
          boxShadow:
            "0 32px 80px rgba(0,0,0,.6)",
        }}
      >
        {/* Header */}

        <div
          className="flex items-center justify-between px-4 py-3 border-b border-white/10"
          style={{
            background:
              "rgba(244,180,0,.12)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)" }}
            >

              {isGroup ? (
                <Hash
                  size={15}
                  style={{ color: "#0F172A" }}
                />
              ) : (
                <span className="text-sm font-bold" style={{ color: "#0F172A" }}>
                  {selectedChat?.user?.name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </span>
              )}

            </div>

            <div>
              <h3 className="text-sm font-bold text-white">

                {isGroup
                  ? "Team Chat"
                  : selectedChat?.user?.name}

              </h3>

              <p className="text-[10px] text-slate-400">

                {isGroup
                  ? "General Channel"
                  : selectedChat?.user
                      ?.online
                  ? "🟢 Online"
                  : "⚫ Offline"}

              </p>

            </div>
          </div>

          <div className="flex items-center gap-1">

            <button
              onClick={onMinimize}
              className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center"
            >
              <Minus
                size={14}
                className="text-slate-300"
              />
            </button>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg hover:bg-red-500/20 flex items-center justify-center"
            >
              <X
                size={14}
                className="text-slate-300"
              />
            </button>

          </div>
        </div>
                {!isMinimized && (
          <div className="flex flex-1 min-h-0">

            {/* Left Sidebar */}

            <ChatSidebarWidget
              users={users}
              currentUser={currentUser}
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
            />

            {/* Chat Area */}

            <div className="flex-1 flex flex-col min-w-0">

              <ChatMessages
                messages={messages}
                currentUser={currentUser}
                onReply={(msg) =>
                  setReplyMessage(msg)
                }
                onDelete={onDelete}
                typingUser={typingUser}
                selectedChat={selectedChat}
              />

              <MessageInput
                onSend={onSend}
                replyMessage={replyMessage}
                setReplyMessage={
                  setReplyMessage
                }
                onTyping={onTyping}
                onStopTyping={
                  onStopTyping
                }
              />

            </div>

          </div>
        )}
      </div>
    </div>
  );
}