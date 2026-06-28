import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import { MessageCircle } from "lucide-react";

export default function MessageList({
  messages = [],
  currentUser,
  onReply,
  onEdit,
  onDelete,
  onReaction,
}) {
  const bottomRef = useRef(null);

  // Auto Scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">

        <div className="w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center">

          <MessageCircle
            size={42}
            className="text-violet-600"
          />

        </div>

        <h2 className="mt-6 text-2xl font-bold text-slate-700">
          No Messages Yet
        </h2>

        <p className="mt-2 text-slate-500">
          Start the conversation 🚀
        </p>

      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-6">

      {messages.map((message) => (

        <MessageBubble
          key={message._id}
          message={message}
          currentUser={currentUser}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onReaction={onReaction}
        />

      ))}

      <div ref={bottomRef} />

    </div>
  );
}