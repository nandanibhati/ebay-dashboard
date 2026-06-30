import { useEffect, useMemo, useRef } from "react";
import { MessageCircle } from "lucide-react";
import MessageBubbleWidget from "./MessageBubbleWidget";

export default function ChatMessages({
  messages,
  currentUser,
  onReply,
  onDelete,
  typingUser,
  selectedChat,
}) {
  const bottomRef = useRef(null);

  // Remove duplicate messages
  const uniqueMessages = useMemo(() => {
    const map = new Map();

    messages.forEach((msg) => {
      map.set(msg._id, msg);
    });

    return Array.from(map.values());
  }, [messages]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [uniqueMessages]);

  if (uniqueMessages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-violet-600/20 flex items-center justify-center">
          <MessageCircle
            size={26}
            className="text-violet-400"
          />
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-slate-300">
            No messages yet
          </p>

          <p className="text-[11px] text-slate-500 mt-0.5">
            {selectedChat?.type === "group"
              ? "Say hi to the team 👋"
              : "Start a private conversation"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">

      {uniqueMessages.map((message) => (
        <MessageBubbleWidget
          key={message._id}
          message={message}
          currentUser={currentUser}
          onReply={onReply}
          onDelete={onDelete}
        />
      ))}

      {/* Typing Indicator */}

      {typingUser &&
        typingUser !== currentUser?.name && (
          <div className="flex items-center gap-2 px-2 py-2">

            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>

            <span className="text-[11px] text-slate-500 italic">
              {typingUser} is typing...
            </span>

          </div>
        )}

      <div ref={bottomRef} />

    </div>
  );
}