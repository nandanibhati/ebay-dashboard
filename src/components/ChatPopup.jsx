import { Minus, X, Hash } from "lucide-react";

import ChatSidebarWidget from "./ChatSidebarWidget";
import ChatMessages from "./ChatMessages";
import MessageInput from "./MessageInput";

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
  if (!isOpen) return null;

  const isGroup =
    selectedChat?.type === "group";

  return (
    <div
      className={`fixed bottom-24 right-6 z-[9998] transition-all duration-300 origin-bottom-right
      ${
        isOpen
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none"
      }`}
      style={{ width: 380 }}
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
              "rgba(109,40,217,.15)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">

              {isGroup ? (
                <Hash
                  size={15}
                  className="text-white"
                />
              ) : (
                <span className="text-white text-sm font-bold">
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