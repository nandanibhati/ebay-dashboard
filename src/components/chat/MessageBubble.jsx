import {
  Check,
  CheckCheck,
  Reply,
  Smile,
  Pencil,
  Trash2,
  MoreVertical,
  Download,
} from "lucide-react";
import { useState } from "react";

export default function MessageBubble({
  message,
  currentUser,
  onReply,
  onEdit,
  onDelete,
  onReaction,
}) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const isMine =
    message.senderEmail ===
   currentUser?.email;

  return (
    <div
      className={`flex mb-5 ${
        isMine
          ? "justify-end"
          : "justify-start"
      }`}
    >
      {!isMine && (
        <div className="mr-3">

          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold">

            {message.senderName?.charAt(0)}

          </div>

        </div>
      )}

      <div
        className={`max-w-[70%] relative group ${
          isMine ? "items-end" : ""
        }`}
      >

        {!isMine && (
          <p className="text-xs font-semibold text-violet-600 mb-1 ml-2">

            {message.senderName}

          </p>
        )}

        {/* Reply Preview */}

        {message.replyTo && (
          <div className="bg-slate-100 rounded-xl px-3 py-2 mb-2 border-l-4 border-violet-500">

            <p className="text-xs font-semibold text-violet-600">

              Reply

            </p>

            <p className="text-xs text-slate-500 truncate">

              {message.replyTo.message}

            </p>

          </div>
        )}

        {/* Bubble */}

        <div
          className={`rounded-2xl px-5 py-3 shadow-sm ${
            isMine
              ? "bg-violet-600 text-white rounded-br-md"
              : "bg-white border border-slate-200 rounded-bl-md"
          }`}
        >

          {/* Message */}

          {message.message && (
            <p className="whitespace-pre-wrap break-words leading-7">

              {message.message}

            </p>
          )}

          {/* Image */}

          {message.image && (
            <img
              src={message.image}
              alt=""
              className="rounded-xl mt-3 max-h-80 object-cover cursor-pointer"
            />
          )}

          {/* File */}

          {message.file && (
            <a
              href={message.file}
              target="_blank"
              rel="noreferrer"
              className={`mt-3 flex items-center gap-2 text-sm ${
                isMine
                  ? "text-white"
                  : "text-violet-600"
              }`}
            >

              <Download size={18} />

              Download Attachment

            </a>
          )}

          {/* Time */}

          <div
            className={`mt-3 flex items-center gap-2 text-[11px] ${
              isMine
                ? "justify-end text-violet-100"
                : "text-slate-400"
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
              <span>(Edited)</span>
            )}

            {isMine &&
              (message.seenBy?.length ? (
                <CheckCheck size={15} />
              ) : (
                <Check size={15} />
              ))}
          </div>

        </div>

        {/* Floating Menu */}

        <div
          className={`absolute top-2 ${
            isMine
              ? "-left-12"
              : "-right-12"
          } opacity-0 group-hover:opacity-100 transition`}
        >

          <button
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            className="w-9 h-9 rounded-full bg-white shadow border flex items-center justify-center"
          >

            <MoreVertical size={18} />

          </button>
                    {menuOpen && (
            <div
              className={`absolute z-50 mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-xl ${
                isMine ? "left-0" : "right-0"
              }`}
            >
              <button
                onClick={() => {
                  onReply(message);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-sm"
              >
                <Reply size={16} />
                Reply
              </button>

              <button
                onClick={() => {
                  onReaction(message);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-sm"
              >
                <Smile size={16} />
                React
              </button>

              {isMine && (
                <>
                  <button
                    onClick={() => {
                      onEdit(message);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-sm"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      onDelete(message);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 text-sm"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
</div>
        {/* Emoji Reactions */}

        {message.reactions?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.reactions.map((reaction, index) => (
              <div
                key={index}
                className="px-2 py-1 rounded-full bg-slate-100 border text-sm flex items-center gap-1"
              >
                <span>{reaction.emoji}</span>

                <span className="text-xs text-slate-500">
                  {reaction.user}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

      {isMine && (
        <div className="ml-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold">
            {currentUser?.name?.charAt(0)}
          </div>
        </div>
      )}
    </div>
  );
}