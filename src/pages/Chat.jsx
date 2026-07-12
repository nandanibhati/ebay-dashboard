// ============================================================
//  Chat.jsx  –  all chat components in one file
//  UI-only changes; all logic, socket events, API calls,
//  state names, and function names are preserved exactly.
// ============================================================

import { useEffect, useRef, useState, useMemo } from "react";
import socket from "../socket";
import { apiFetch } from "../api";
import Sidebar from "../components/Sidebar";
import EmployeeSidebar from "../components/EmployeeSidebar";
import {
  Send, Smile, Paperclip, Image, Mic, X, Search, Users, Hash,
  Circle, Phone, Video, MoreVertical, Check, CheckCheck, Reply,
  Pencil, Trash2, Download, MessageCircle, Clock,
} from "lucide-react";

/* Design tokens - matches Dashboard.jsx
   Gold: #F4B400  Blue: #2563EB  Emerald: #22C55E
   Amber: #F59E0B  Dark navy: #0F172A
*/

const FONT_LINK_ID = "ebay-dash-fonts";
function ensureFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700&display=swap";
  document.head.appendChild(link);
}

// Same hash-based per-person color used on the Dashboard's Recent Orders
// table, reused here so a person's identity color matches across the app.
function Avatar({ name = "?", size = "w-10 h-10 text-sm" }) {
  const initials = (name || "?").charAt(0).toUpperCase();
  const hue = (name.charCodeAt(0) * 47) % 360;
  return (
    <div
      className={`${size} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ background: `linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${hue},70%,40%))` }}
    >
      {initials}
    </div>
  );
}

// Phone photos are often several MB at 3000px+ — shrink to a sane max
// dimension client-side before upload so sending feels instant, not stuck.
function compressImage(file, maxDim = 1280, quality = 0.75) {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) return resolve(file);

    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width <= maxDim && height <= maxDim) return resolve(file);

      const scale = maxDim / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => resolve(file);
    img.src = url;
  });
}

// ─────────────────────────────────────────────
// EmojiPicker
// ─────────────────────────────────────────────
const EMOJIS = [
  "😀","😁","😂","🤣","😊","😍","😘","😎",
  "😭","😡","👍","👎","👏","🙏","🔥","❤️",
  "💙","💚","💛","💜","🎉","🤝","👌","😴",
];

function EmojiPicker({ onSelect }) {
  return (
    <div className="absolute bottom-16 left-0 w-72 rounded-2xl border border-slate-200 bg-white shadow-2xl p-4 z-50">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Reactions</p>
      <div className="grid grid-cols-6 gap-2">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="text-2xl hover:scale-125 transition-transform duration-100 rounded-lg hover:bg-slate-50 p-1"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MessageBubble
// ─────────────────────────────────────────────
function TickStatus({ status }) {
  if (status === "pending") return <Clock size={12} className="opacity-70" />;
  if (status === "seen") return <CheckCheck size={13} className="text-sky-300" />;
  if (status === "delivered") return <CheckCheck size={13} />;
  return <Check size={13} />;
}

function MessageBubble({ message, currentUser, onlineUsers, onReply, onEdit, onDelete, onReaction }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isMine = message.senderEmail === currentUser?.email;

  let tickStatus = "sent";
  if (message.pending) {
    tickStatus = "pending";
  } else if (message.chatType === "group") {
    tickStatus = message.seenBy?.length > 0 ? "seen" : "sent";
  } else if (message.seenBy?.includes(message.receiverEmail)) {
    tickStatus = "seen";
  } else if (onlineUsers?.includes(message.receiverEmail)) {
    tickStatus = "delivered";
  }

  return (
    <div className={`flex mb-4 items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
      {/* Other user avatar */}
      {!isMine && <Avatar name={message.senderName} size="w-8 h-8 text-xs" />}

      <div className={`max-w-[65%] relative group ${isMine ? "items-end" : ""}`}>
        {!isMine && (
          <p className="text-[11px] font-semibold mb-1 ml-1" style={{ color: "#B45F06" }}>
            {message.senderName}
          </p>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <div className={`rounded-xl px-3 py-2 mb-1.5 border-l-4 text-xs ${isMine ? "bg-black/20 border-[#F4B400]" : "bg-slate-100 border-[#F4B400]"}`}>
            <p className={`font-semibold mb-0.5 ${isMine ? "text-amber-300" : ""}`} style={!isMine ? { color: "#B45F06" } : {}}>Reply</p>
            <p className={`truncate ${isMine ? "text-slate-300" : "text-slate-500"}`}>
              {message.replyTo.message}
            </p>
          </div>
        )}

        {/* Bubble */}
        <div className={`rounded-2xl px-4 py-3 shadow-sm ${
          isMine
            ? "text-white rounded-br-sm"
            : "bg-white border border-slate-100 text-slate-800 rounded-bl-sm"
        }`}
          style={isMine ? { background: "linear-gradient(160deg, #1E293B, #0F172A)" } : {}}
        >
          {message.message && (
            <p className="whitespace-pre-wrap break-words leading-relaxed text-sm">
              {message.message}
            </p>
          )}

          {message.image && (
            <img
              src={message.image}
              alt=""
              className="rounded-xl mt-2 max-h-64 object-cover cursor-pointer w-full"
            />
          )}

          {message.file && (
            <a
              href={message.file}
              target="_blank"
              rel="noreferrer"
              className={`mt-2 flex items-center gap-2 text-xs font-medium ${isMine ? "text-slate-300 hover:text-white" : ""}`}
              style={!isMine ? { color: "#B45F06" } : {}}
            >
              <Download size={14} />
              Download Attachment
            </a>
          )}

          {/* Timestamp */}
          <div className={`mt-2 flex items-center gap-1.5 text-[10px] ${isMine ? "justify-end text-slate-400" : "text-slate-400"}`}>
            <span>
              {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {message.edited && <span className="italic">(edited)</span>}
            {message.failed && <span className="text-red-300">Failed to send</span>}
            {isMine && !message.failed && <TickStatus status={tickStatus} />}
          </div>
        </div>

        {/* Emoji reactions */}
        {message.reactions?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {message.reactions.map((r, i) => (
              <div key={i} className="px-2 py-0.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs flex items-center gap-1">
                <span>{r.emoji}</span>
                <span className="text-slate-400">{r.user}</span>
              </div>
            ))}
          </div>
        )}

        {/* Hover action button */}
        {!message.pending && (
        <div className={`absolute top-1 ${isMine ? "-left-10" : "-right-10"} opacity-0 group-hover:opacity-100 transition-opacity duration-150`}>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition"
            >
              <MoreVertical size={15} className="text-slate-500" />
            </button>

            {menuOpen && (
              <div
                className={`absolute z-50 mt-1 w-44 rounded-xl border border-slate-100 bg-white shadow-xl overflow-hidden ${isMine ? "left-0" : "right-0"}`}
              >
                {[
                  { icon: Reply, label: "Reply", action: () => { onReply(message); setMenuOpen(false); } },
                  { icon: Smile, label: "React", action: () => { onReaction(message); setMenuOpen(false); } },
                  ...(isMine ? [
                    { icon: Pencil, label: "Edit", action: () => { onEdit(message); setMenuOpen(false); } },
                    { icon: Trash2, label: "Delete for Everyone", action: () => { onDelete(message); setMenuOpen(false); }, danger: true },
                  ] : []),
                ].map(({ icon: Icon, label, action, danger }) => (
                  <button
                    key={label}
                    onClick={action}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors ${danger ? "text-red-500 hover:bg-red-50" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* My avatar */}
      {isMine && <Avatar name={currentUser?.name} size="w-8 h-8 text-xs" />}
    </div>
  );
}

// ─────────────────────────────────────────────
// MessageList
// ─────────────────────────────────────────────
function MessageList({ messages = [], currentUser, onlineUsers, onReply, onEdit, onDelete, onReaction }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <MessageCircle size={36} style={{ color: "#B45F06" }} />
        </div>
        <h2 className="text-lg font-bold text-slate-700" style={{ fontFamily: "Sora, sans-serif" }}>No Messages Yet</h2>
        <p className="mt-1 text-sm text-slate-400">Start the conversation 🚀</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-5 space-y-1">
      {messages.map((message) => (
        <MessageBubble
          key={message._id}
          message={message}
          currentUser={currentUser}
          onlineUsers={onlineUsers}
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

// ─────────────────────────────────────────────
// OnlineUsers  (compact horizontal strip)
// ─────────────────────────────────────────────
function OnlineUsers({ users = [], selectedChat, setSelectedChat }) {
  const online = users.filter((u) => u.online);

  if (online.length === 0) return null;

  return (
    <div className="bg-white border-b border-slate-100 px-5 py-2.5 flex items-center gap-3 overflow-x-auto">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap flex-shrink-0">
        Online
      </span>
      {online.map((user) => (
        <button
          key={user.email}
          onClick={() => setSelectedChat({ type: "private", id: user.email, user })}
          className={`flex flex-col items-center flex-shrink-0 transition-transform duration-150 ${selectedChat?.id === user.email ? "scale-110" : "hover:scale-105"}`}
        >
          <div className="relative">
            <Avatar name={user.name} size="w-9 h-9 text-sm" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <p className="text-[10px] mt-1 text-slate-500 truncate w-12 text-center">{user.name?.split(" ")[0]}</p>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// ChatHeader
// ─────────────────────────────────────────────
function ChatHeader({ selectedChat, typingUser }) {
  const isGroup = selectedChat?.type === "group";

  return (
    <div className="h-16 bg-white border-b border-slate-900/[0.06] px-5 flex items-center justify-between flex-shrink-0 shadow-sm">
      <div className="flex items-center gap-3">
        {isGroup ? (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base"
            style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A" }}
          >
            #
          </div>
        ) : (
          <div className="relative">
            <Avatar name={selectedChat?.user?.name} size="w-10 h-10 text-base" />
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${selectedChat?.user?.online ? "bg-emerald-400" : "bg-slate-300"}`} />
          </div>
        )}

        <div>
          <h2 className="text-sm font-bold text-slate-800 leading-tight" style={{ fontFamily: "Sora, sans-serif" }}>
            {isGroup ? "General Team Chat" : selectedChat?.user?.name}
          </h2>
          <p className="text-xs leading-tight mt-0.5">
            {isGroup ? (
              <span className="text-slate-400">Everyone can chat here</span>
            ) : typingUser ? (
              <span className="font-medium animate-pulse" style={{ color: "#B45F06" }}>Typing…</span>
            ) : selectedChat?.user?.online ? (
              <span className="text-emerald-500 font-medium">● Online</span>
            ) : (
              <span className="text-slate-400">Offline</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {[Search, Phone, Video, MoreVertical].map((Icon, i) => (
          <button
            key={i}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors duration-150"
          >
            <Icon size={18} className="text-slate-500" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ChatSidebar
// ─────────────────────────────────────────────
function ChatSidebar({ users = [], currentUser, selectedChat, setSelectedChat }) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() =>
    users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase())),
    [users, search]
  );

  return (
    <div className="w-72 h-full bg-white border-r border-slate-100 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <h1 className="text-lg font-extrabold text-slate-800 tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>Team Chat</h1>
        <p className="text-xs text-slate-400 mt-0.5">Internal communication</p>

        <div className="relative mt-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/15 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* General */}
        <button
          onClick={() => setSelectedChat({ type: "group", id: "general" })}
          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors duration-150 ${
            selectedChat?.id === "general"
              ? "bg-amber-50 border-r-[3px] border-[#F4B400]"
              : "hover:bg-slate-50"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Hash size={18} style={{ color: "#B45F06" }} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <h3 className="text-sm font-semibold text-slate-800">General</h3>
            <p className="text-xs text-slate-400 truncate">Team Discussion</p>
          </div>
          <span
            className="text-[10px] font-bold rounded-full px-2 py-0.5 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A" }}
          >
            ALL
          </span>
        </button>

        {/* Section label */}
        <div className="px-4 mt-4 mb-1.5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Direct Messages</p>
        </div>

        {filteredUsers.map((user) => (
          <button
            key={user.email}
            onClick={() => setSelectedChat({ type: "private", id: user.email, user })}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors duration-150 ${
              selectedChat?.id === user.email
                ? "bg-amber-50 border-r-[3px] border-[#F4B400]"
                : "hover:bg-slate-50"
            }`}
          >
            <div className="relative flex-shrink-0">
              <Avatar name={user.name} size="w-10 h-10 text-sm" />
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${user.online ? "bg-emerald-400" : "bg-slate-300"}`} />
            </div>

            <div className="flex-1 text-left min-w-0">
              <h3 className="text-sm font-semibold text-slate-800 truncate">{user.name}</h3>
              <p className={`text-xs ${user.online ? "text-emerald-500 font-medium" : "text-slate-400"}`}>
                {user.online ? "● Online" : "Offline"}
              </p>
            </div>

            {user.unread > 0 && (
              <span className="flex-shrink-0 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                {user.unread}
              </span>
            )}
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Users size={26} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-600">No Employee Found</h3>
            <p className="text-xs text-slate-400 mt-1">Try a different name.</p>
          </div>
        )}
      </div>

      {/* Footer — current user */}
      <div className="border-t border-slate-100 p-4 bg-slate-50/80">
        <div className="flex items-center gap-3">
          <Avatar name={currentUser?.name} size="w-9 h-9 text-sm" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 truncate">{currentUser?.name}</h3>
            <p className="text-xs text-emerald-500 font-medium">● Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ChatInput
// ─────────────────────────────────────────────
function ChatInput({ onSend, replyMessage, setReplyMessage, onTyping, onStopTyping }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);

  const imageRef = useRef(null);
  const fileRef = useRef(null);

  const sendMessage = () => {
    if (!text.trim() && !image && !file) return;
    onSend({ message: text, image, file, replyTo: replyMessage });
    setText("");
    setImage(null);
    setFile(null);
    setShowEmoji(false);
    onStopTyping?.();
    if (setReplyMessage) setReplyMessage(null);
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (e.target.value.trim()) onTyping?.();
    else onStopTyping?.();
  };

  return (
    <div className="bg-white border-t border-slate-100 flex-shrink-0">
      {/* Reply preview */}
      {replyMessage && (
        <div className="mx-4 mt-3 rounded-xl border-l-4 border-[#F4B400] bg-amber-50 px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#B45F06" }}>Replying to</p>
            <p className="text-sm text-slate-600 truncate mt-0.5">{replyMessage.message}</p>
          </div>
          <button onClick={() => setReplyMessage(null)} className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-amber-100 flex items-center justify-center transition">
            <X size={14} className="text-slate-500" />
          </button>
        </div>
      )}

      {/* Attachment previews */}
      {(image || file) && (
        <div className="px-4 pt-3 flex flex-col gap-2">
          {image && (
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
              <div>
                <p className="text-xs font-semibold text-slate-700">🖼 Image Selected</p>
                <p className="text-xs text-slate-400 truncate max-w-[200px]">{image.name}</p>
              </div>
              <button onClick={() => setImage(null)} className="w-6 h-6 rounded-full hover:bg-slate-200 flex items-center justify-center transition">
                <X size={14} />
              </button>
            </div>
          )}
          {file && (
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
              <div>
                <p className="text-xs font-semibold text-slate-700">📎 File Selected</p>
                <p className="text-xs text-slate-400 truncate max-w-[200px]">{file.name}</p>
              </div>
              <button onClick={() => setFile(null)} className="w-6 h-6 rounded-full hover:bg-slate-200 flex items-center justify-center transition">
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2 px-4 py-3 relative">
        {/* Emoji */}
        <div className="relative">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition text-slate-500 hover:text-[#B45F06]"
          >
            <Smile size={20} />
          </button>
          {showEmoji && (
            <EmojiPicker onSelect={(emoji) => { setText((t) => t + emoji); setShowEmoji(false); }} />
          )}
        </div>

        <button
          onClick={() => imageRef.current.click()}
          className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition text-slate-500 hover:text-[#B45F06]"
        >
          <Image size={20} />
        </button>

        <button
          onClick={() => fileRef.current.click()}
          className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition text-slate-500 hover:text-[#B45F06]"
        >
          <Paperclip size={20} />
        </button>

        <input hidden ref={imageRef} type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        <input hidden ref={fileRef} type="file" onChange={(e) => setFile(e.target.files[0])} />

        <input
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Type a message…"
          className="flex-1 rounded-full border border-slate-200 bg-slate-50 focus:bg-white px-5 py-2.5 text-sm outline-none focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/15 transition-all"
        />

        <button className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition text-slate-500 hover:text-[#B45F06]">
          <Mic size={20} />
        </button>

        <button
          onClick={sendMessage}
          className="w-10 h-10 rounded-full active:scale-95 flex items-center justify-center shadow-md transition-all duration-150"
          style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A", boxShadow: "0 6px 16px -4px rgba(244,180,0,0.5)" }}
        >
          <Send size={17} />
        </button>
      </div>

      {text.trim() && (
        <p className="px-5 pb-2 text-[11px] font-medium animate-pulse" style={{ color: "#B45F06" }}>Typing…</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Chat  (main page)
// ─────────────────────────────────────────────
export default function Chat() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  const currentUser = {
    name: localStorage.getItem("employeeName"),
    email: localStorage.getItem("employeeEmail"),
    role: localStorage.getItem("role"),
  };

  const [selectedChat, setSelectedChat] = useState({ type: "group", id: "general" });

  useEffect(() => {
    ensureFonts();
  }, []);

  // Socket handlers close over stale state if we don't track the
  // current selection in a ref, since the subscription effect below
  // only runs once on mount.
  const selectedChatRef = useRef(selectedChat);
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Load employees
  useEffect(() => {
    apiFetch("/api/auth/employees")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;
        setUsers(data.employees.map((emp) => ({ ...emp, online: false, unread: 0 })));
      });
  }, []);

  // Socket join
  useEffect(() => {
    if (!currentUser.email) return;
    socket.emit("join", currentUser.email);
  }, []);

  // Socket events
  useEffect(() => {
    socket.on("newMessage", (message) => {
      const chat = selectedChatRef.current;

      const belongsToCurrentChat =
        chat.type === "group"
          ? message.chatType === "group"
          : message.chatType === "private" &&
            ((message.senderEmail === currentUser.email &&
              message.receiverEmail === chat.user?.email) ||
              (message.senderEmail === chat.user?.email &&
                message.receiverEmail === currentUser.email));

      if (belongsToCurrentChat) {
        setMessages((prev) => {
          // Group messages broadcast to everyone including the sender, who
          // already has this message via the optimistic-send reconciliation
          // — skip re-appending anything we're already showing.
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    });

    socket.on("onlineUsers", (list) => {
      setOnlineUsers(list);
      setUsers((prev) => prev.map((u) => ({ ...u, online: list.includes(u.email) })));
    });

    socket.on("typing", (data) => setTypingUser(data.senderName));
    socket.on("stopTyping", () => setTypingUser(""));

    // Someone deleted a message "for everyone" — drop it from whatever
    // chat window is currently open, live, instead of waiting for reload.
    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });

    // The other side just read one of my messages — flip its ticks to
    // "seen" without needing to refetch the whole conversation.
    socket.on("messageSeenUpdate", ({ messageId, seenByEmail }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId && !m.seenBy?.includes(seenByEmail)
            ? { ...m, seenBy: [...(m.seenBy || []), seenByEmail] }
            : m
        )
      );
    });

    return () => {
      socket.off("newMessage");
      socket.off("onlineUsers");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("messageDeleted");
      socket.off("messageSeenUpdate");
    };
  }, []);

  // Mark incoming messages in the open conversation as seen, and tell the
  // sender live so their ticks flip without them needing to reopen the chat.
  useEffect(() => {
    const unseen = messages.filter(
      (m) =>
        !m.pending &&
        m.senderEmail !== currentUser.email &&
        !m.seenBy?.includes(currentUser.email)
    );
    if (unseen.length === 0) return;

    unseen.forEach((m) => {
      apiFetch(`/api/chat/seen/${m._id}`, {
        method: "PUT",
        body: { email: currentUser.email },
      }).catch(() => {});

      socket.emit("messageSeen", {
        messageId: m._id,
        seenByEmail: currentUser.email,
      });
    });

    setMessages((prev) =>
      prev.map((m) =>
        unseen.some((u) => u._id === m._id)
          ? { ...m, seenBy: [...(m.seenBy || []), currentUser.email] }
          : m
      )
    );
  }, [messages, currentUser.email]);

  // Load messages
  useEffect(() => {
    if (selectedChat.type === "group") loadGroupMessages();
    else loadPrivateMessages();
  }, [selectedChat]);

  async function loadGroupMessages() {
    const res = await apiFetch("/api/chat/group");
    const data = await res.json();
    if (data.success) setMessages(data.chats);
  }

  async function loadPrivateMessages() {
    const res = await apiFetch(
      `/api/chat/private/${currentUser.email}/${selectedChat.user.email}`
    );
    const data = await res.json();
    if (data.success) setMessages(data.chats);
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#F8FAFC", fontFamily: "Inter, ui-sans-serif, system-ui" }}>
      {/* Fixed nav sidebar — renders at left:0, width ~280px */}
      {currentUser.role === "admin" ? <Sidebar /> : <EmployeeSidebar />}

      {/* Everything else pushed past the fixed sidebar */}
      <div className="flex flex-1 ml-72 h-screen overflow-hidden">

      <ChatSidebar
        users={users}
        onlineUsers={onlineUsers}
        currentUser={currentUser}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ChatHeader selectedChat={selectedChat} typingUser={typingUser} />

        <OnlineUsers
          users={users}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
        />

        <MessageList
          messages={messages}
          currentUser={currentUser}
          onlineUsers={onlineUsers}
          onReply={(msg) => setReplyMessage(msg)}
          onEdit={(msg) => console.log("Edit", msg)}
          onDelete={async (msg) => {
            setMessages((prev) => prev.filter((m) => m._id !== msg._id));
            await apiFetch(`/api/chat/${msg._id}`, { method: "DELETE" });
            socket.emit("deleteMessage", { messageId: msg._id });
          }}
          onReaction={(msg) => console.log("Reaction", msg)}
        />

        <ChatInput
          replyMessage={replyMessage}
          setReplyMessage={setReplyMessage}
          onTyping={() => socket.emit("typing", { senderName: currentUser.name })}
          onStopTyping={() => socket.emit("stopTyping")}
          onSend={async (data) => {
            const isPrivate = selectedChat.type === "private";
            const receiverName = isPrivate ? selectedChat.user.name : "";
            const receiverEmail = isPrivate ? selectedChat.user.email : "";

            // Show the message immediately instead of waiting on the full
            // upload + save + socket round-trip — that wait is what made
            // sending feel sluggish, especially with an image attached.
            const tempId = `temp-${Date.now()}-${Math.random()}`;
            const optimisticImage = data.image ? URL.createObjectURL(data.image) : "";
            const optimisticFile = data.file ? URL.createObjectURL(data.file) : "";

            setMessages((prev) => [
              ...prev,
              {
                _id: tempId,
                senderName: currentUser.name,
                senderEmail: currentUser.email,
                senderRole: currentUser.role,
                receiverName,
                receiverEmail,
                chatType: selectedChat.type,
                message: data.message || "",
                image: optimisticImage,
                file: optimisticFile,
                replyTo: data.replyTo || null,
                reactions: [],
                seenBy: [],
                createdAt: new Date().toISOString(),
                pending: true,
              },
            ]);
            setReplyMessage(null);

            const imageToSend = data.image ? await compressImage(data.image) : null;

            let body;
            if (imageToSend || data.file) {
              body = new FormData();
              body.append("senderName", currentUser.name);
              body.append("senderEmail", currentUser.email);
              body.append("senderRole", currentUser.role);
              body.append("receiverName", receiverName);
              body.append("receiverEmail", receiverEmail);
              body.append("chatType", selectedChat.type);
              body.append("message", data.message || "");
              body.append("voice", "");
              if (data.replyTo) body.append("replyTo", data.replyTo._id);
              if (imageToSend) body.append("image", imageToSend);
              if (data.file) body.append("file", data.file);
            } else {
              body = {
                senderName: currentUser.name,
                senderEmail: currentUser.email,
                senderRole: currentUser.role,
                receiverName,
                receiverEmail,
                chatType: selectedChat.type,
                message: data.message,
                image: "",
                file: "",
                voice: "",
                replyTo: data.replyTo ? data.replyTo._id : null,
              };
            }

            try {
              const res = await apiFetch("/api/chat/send", {
                method: "POST",
                body,
              });
              const result = await res.json();

              if (result.success) {
                setMessages((prev) =>
                  prev.map((m) => (m._id === tempId ? result.chat : m))
                );
                socket.emit("sendMessage", result.chat);
              } else {
                setMessages((prev) =>
                  prev.map((m) => (m._id === tempId ? { ...m, failed: true, pending: false } : m))
                );
              }
            } catch (err) {
              console.error(err);
              setMessages((prev) =>
                prev.map((m) => (m._id === tempId ? { ...m, failed: true, pending: false } : m))
              );
            }
          }}
        />
      </div>
      </div>
    </div>
  );
}
