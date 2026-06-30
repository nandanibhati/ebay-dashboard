import {
  Reply,
  Trash2,
  MoreVertical,
  Check,
  CheckCheck,
  Download,
} from "lucide-react";
import { useState } from "react";

export default function MessageBubbleWidget({
  message,
  currentUser,
  onReply,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const isMine =
    message.senderEmail === currentUser?.email;

  return (
    <div
      className={`flex items-end gap-1.5 mb-3 ${
        isMine
          ? "justify-end"
          : "justify-start"
      }`}
    >
      {/* Sender Avatar */}

      {!isMine && (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mb-1">
          {message.senderName
            ?.charAt(0)
            ?.toUpperCase()}
        </div>
      )}

      <div
        className={`relative flex flex-col max-w-[78%] group ${
          isMine
            ? "items-end"
            : "items-start"
        }`}
      >
        {/* Sender Name */}

        {!isMine && (
          <span className="text-[10px] font-semibold text-violet-400 mb-1 ml-1">
            {message.senderName}
          </span>
        )}

        {/* Reply Preview */}

        {message.replyTo && (
          <div
            className={`rounded-lg px-2.5 py-1.5 mb-1 border-l-[3px] border-violet-400 text-[10px] ${
              isMine
                ? "bg-indigo-700/40"
                : "bg-slate-700/60"
            }`}
          >
            <p className="font-semibold text-violet-300">
              Reply
            </p>

            <p className="text-slate-400 truncate">
              {message.replyTo.message}
            </p>
          </div>
        )}

        {/* Bubble */}

        <div
          className={`rounded-2xl px-3 py-2 shadow-sm relative ${
            isMine
              ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-sm"
              : "bg-slate-700/80 text-slate-100 rounded-bl-sm"
          }`}
        >
          {/* Text */}

          {message.message && (
            <p className="whitespace-pre-wrap break-words text-[13px]">
              {message.message}
            </p>
          )}

          {/* Image */}

          {message.image && (
            <img
              src={message.image}
              alt=""
              className="rounded-xl mt-2 max-h-44 w-full object-cover cursor-pointer"
            />
          )}

          {/* File */}

          {message.file && (
            <a
              href={message.file}
              target="_blank"
              rel="noreferrer"
              className={`mt-2 flex items-center gap-1.5 text-[11px] font-medium ${
                isMine
                  ? "text-violet-200"
                  : "text-violet-400"
              }`}
            >
              <Download size={12} />
              Download File
            </a>
          )}

          {/* Time */}

          <div
            className={`mt-1.5 flex items-center gap-1 text-[10px] ${
              isMine
                ? "justify-end text-violet-200/70"
                : "text-slate-500"
            }`}
          >
            <span>
              {new Date(
                message.createdAt
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            {message.edited && (
              <span className="italic">
                edited
              </span>
            )}

            {isMine &&
              (message.seenBy?.length ? (
                <CheckCheck size={11} />
              ) : (
                <Check size={11} />
              ))}
          </div>
        </div>
                {/* Reactions */}
        {message.reactions?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.reactions.map((reaction, index) => (
              <span
                key={index}
                className="bg-slate-700/60 border border-white/10 rounded-full px-1.5 py-0.5 text-[11px]"
              >
                {reaction.emoji}
              </span>
            ))}
          </div>
        )}

        {/* Hover Actions */}
        <div
          className={`absolute top-0 ${
            isMine ? "-left-16" : "-right-16"
          } opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1`}
        >
          {/* Reply */}
          <button
            onClick={() => onReply(message)}
            className="w-6 h-6 rounded-full bg-slate-700/90 hover:bg-slate-600 border border-white/10 flex items-center justify-center transition"
            title="Reply"
          >
            <Reply size={11} className="text-slate-300" />
          </button>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-6 h-6 rounded-full bg-slate-700/90 hover:bg-slate-600 border border-white/10 flex items-center justify-center transition"
            >
              <MoreVertical
                size={11}
                className="text-slate-300"
              />
            </button>

            {menuOpen && (
              <div
                className={`absolute bottom-full mb-1 ${
                  isMine ? "right-0" : "left-0"
                } w-28 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50`}
              >
                <button
                  onClick={() => {
                    onReply(message);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-slate-300 hover:bg-white/5 transition"
                >
                  <Reply size={11} />
                  Reply
                </button>

                {isMine && (
                  <button
                    onClick={() => {
                      onDelete(message);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-red-400 hover:bg-red-500/20 transition"
                  >
                    <Trash2 size={11} />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* My Avatar */}
      {isMine && (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mb-1">
          {currentUser?.name
            ?.charAt(0)
            ?.toUpperCase()}
        </div>
      )}
    </div>
  );
}