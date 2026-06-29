// ============================================================
//  Chat.jsx  –  all chat components in one file
//  UI-only changes; all logic, socket events, API calls,
//  state names, and function names are preserved exactly.
// ============================================================

import { useEffect, useRef, useState, useMemo } from "react";
import socket from "../socket";
import Sidebar from "../components/Sidebar";
import EmployeeSidebar from "../components/EmployeeSidebar";
import {
  Send, Smile, Paperclip, Image, Mic, X, Search, Users, Hash,
  Circle, Phone, Video, MoreVertical, Check, CheckCheck, Reply,
  Pencil, Trash2, Download, MessageCircle,
} from "lucide-react";

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
function MessageBubble({ message, currentUser, onReply, onEdit, onDelete, onReaction }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isMine = message.senderEmail === currentUser?.email;

  return (
    <div className={`flex mb-4 items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
      {/* Other user avatar */}
      {!isMine && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-1">
          {message.senderName?.charAt(0)}
        </div>
      )}

      <div className={`max-w-[65%] relative group ${isMine ? "items-end" : ""}`}>
        {!isMine && (
          <p className="text-[11px] font-semibold text-violet-600 mb-1 ml-1">
            {message.senderName}
          </p>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <div className={`rounded-xl px-3 py-2 mb-1.5 border-l-4 border-violet-400 text-xs ${isMine ? "bg-violet-700/40" : "bg-slate-100"}`}>
            <p className={`font-semibold mb-0.5 ${isMine ? "text-violet-200" : "text-violet-600"}`}>Reply</p>
            <p className={`truncate ${isMine ? "text-violet-100" : "text-slate-500"}`}>
              {message.replyTo.message}
            </p>
          </div>
        )}

        {/* Bubble */}
        <div className={`rounded-2xl px-4 py-3 shadow-sm ${
          isMine
            ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-sm"
            : "bg-white border border-slate-100 text-slate-800 rounded-bl-sm"
        }`}>
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
              className={`mt-2 flex items-center gap-2 text-xs font-medium ${isMine ? "text-violet-100 hover:text-white" : "text-violet-600 hover:text-violet-700"}`}
            >
              <Download size={14} />
              Download Attachment
            </a>
          )}

          {/* Timestamp */}
          <div className={`mt-2 flex items-center gap-1.5 text-[10px] ${isMine ? "justify-end text-violet-200" : "text-slate-400"}`}>
            <span>
              {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {message.edited && <span className="italic">(edited)</span>}
            {isMine && (message.seenBy?.length ? <CheckCheck size={13} /> : <Check size={13} />)}
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
                className={`absolute z-50 mt-1 w-40 rounded-xl border border-slate-100 bg-white shadow-xl overflow-hidden ${isMine ? "left-0" : "right-0"}`}
              >
                {[
                  { icon: Reply, label: "Reply", action: () => { onReply(message); setMenuOpen(false); } },
                  { icon: Smile, label: "React", action: () => { onReaction(message); setMenuOpen(false); } },
                  ...(isMine ? [
                    { icon: Pencil, label: "Edit", action: () => { onEdit(message); setMenuOpen(false); } },
                    { icon: Trash2, label: "Delete", action: () => { onDelete(message); setMenuOpen(false); }, danger: true },
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
      </div>

      {/* My avatar */}
      {isMine && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-1">
          {currentUser?.name?.charAt(0)}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MessageList
// ─────────────────────────────────────────────
function MessageList({ messages = [], currentUser, onReply, onEdit, onDelete, onReaction }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
        <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mb-4">
          <MessageCircle size={36} className="text-violet-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-700">No Messages Yet</h2>
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
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              {user.name?.charAt(0)}
            </div>
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
    <div className="h-16 bg-white border-b border-slate-100 px-5 flex items-center justify-between flex-shrink-0 shadow-sm">
      <div className="flex items-center gap-3">
        {isGroup ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base">
            #
          </div>
        ) : (
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base">
              {selectedChat?.user?.name?.charAt(0)}
            </div>
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${selectedChat?.user?.online ? "bg-emerald-400" : "bg-slate-300"}`} />
          </div>
        )}

        <div>
          <h2 className="text-sm font-bold text-slate-800 leading-tight">
            {isGroup ? "General Team Chat" : selectedChat?.user?.name}
          </h2>
          <p className="text-xs leading-tight mt-0.5">
            {isGroup ? (
              <span className="text-slate-400">Everyone can chat here</span>
            ) : typingUser ? (
              <span className="text-violet-500 font-medium animate-pulse">Typing…</span>
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
        <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">Team Chat</h1>
        <p className="text-xs text-slate-400 mt-0.5">Internal communication</p>

        <div className="relative mt-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
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
              ? "bg-violet-50 border-r-[3px] border-violet-600"
              : "hover:bg-slate-50"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Hash size={18} className="text-violet-600" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <h3 className="text-sm font-semibold text-slate-800">General</h3>
            <p className="text-xs text-slate-400 truncate">Team Discussion</p>
          </div>
          <span className="text-[10px] font-bold bg-violet-600 text-white rounded-full px-2 py-0.5 flex-shrink-0">ALL</span>
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
                ? "bg-violet-50 border-r-[3px] border-violet-600"
                : "hover:bg-slate-50"
            }`}
          >
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                {user.name?.charAt(0)}
              </div>
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${user.online ? "bg-emerald-400" : "bg-slate-300"}`} />
            </div>

            <div className="flex-1 text-left min-w-0">
              <h3 className="text-sm font-semibold text-slate-800 truncate">{user.name}</h3>
              <p className={`text-xs ${user.online ? "text-emerald-500 font-medium" : "text-slate-400"}`}>
                {user.online ? "● Online" : "Offline"}
              </p>
            </div>

            {user.unread > 0 && (
              <span className="flex-shrink-0 bg-violet-600 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
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
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {currentUser?.name?.charAt(0)}
          </div>
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
        <div className="mx-4 mt-3 rounded-xl border-l-4 border-violet-500 bg-violet-50 px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-violet-600 uppercase tracking-wide">Replying to</p>
            <p className="text-sm text-slate-600 truncate mt-0.5">{replyMessage.message}</p>
          </div>
          <button onClick={() => setReplyMessage(null)} className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-violet-100 flex items-center justify-center transition">
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
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition text-slate-500 hover:text-violet-600"
          >
            <Smile size={20} />
          </button>
          {showEmoji && (
            <EmojiPicker onSelect={(emoji) => { setText((t) => t + emoji); setShowEmoji(false); }} />
          )}
        </div>

        <button
          onClick={() => imageRef.current.click()}
          className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition text-slate-500 hover:text-violet-600"
        >
          <Image size={20} />
        </button>

        <button
          onClick={() => fileRef.current.click()}
          className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition text-slate-500 hover:text-violet-600"
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
          className="flex-1 rounded-full border border-slate-200 bg-slate-50 focus:bg-white px-5 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
        />

        <button className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition text-slate-500 hover:text-violet-600">
          <Mic size={20} />
        </button>

        <button
          onClick={sendMessage}
          className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-700 active:scale-95 text-white flex items-center justify-center shadow-md shadow-violet-200 transition-all duration-150"
        >
          <Send size={17} />
        </button>
      </div>

      {text.trim() && (
        <p className="px-5 pb-2 text-[11px] text-violet-400 font-medium animate-pulse">Typing…</p>
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

  // Load employees
  useEffect(() => {
    fetch("https://ebay-dashboard-z7h2.onrender.com/api/auth/employees")
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
    socket.on("newMessage", (message) => setMessages((prev) => [...prev, message]));

    socket.on("onlineUsers", (list) => {
      setOnlineUsers(list);
      setUsers((prev) => prev.map((u) => ({ ...u, online: list.includes(u.email) })));
    });

    socket.on("typing", (data) => setTypingUser(data.senderName));
    socket.on("stopTyping", () => setTypingUser(""));

    return () => {
      socket.off("newMessage");
      socket.off("onlineUsers");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, []);

  // Load messages
  useEffect(() => {
    if (selectedChat.type === "group") loadGroupMessages();
    else loadPrivateMessages();
  }, [selectedChat]);

  async function loadGroupMessages() {
    const res = await fetch("https://ebay-dashboard-z7h2.onrender.com/api/chat/group");
    const data = await res.json();
    if (data.success) setMessages(data.chats);
  }

  async function loadPrivateMessages() {
    const res = await fetch(
      `https://ebay-dashboard-z7h2.onrender.com/api/chat/private/${currentUser.email}/${selectedChat.user.email}`
    );
    const data = await res.json();
    if (data.success) setMessages(data.chats);
  }

  return (
    <div className="h-screen flex bg-slate-100 overflow-hidden">
      {currentUser.role === "admin" ? <Sidebar /> : <EmployeeSidebar />}

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
          onReply={(msg) => setReplyMessage(msg)}
          onEdit={(msg) => console.log("Edit", msg)}
          onDelete={async (msg) => {
            await fetch(`https://ebay-dashboard-z7h2.onrender.com/api/chat/${msg._id}`, { method: "DELETE" });
            setMessages((prev) => prev.filter((m) => m._id !== msg._id));
          }}
          onReaction={(msg) => console.log("Reaction", msg)}
        />

        <ChatInput
          replyMessage={replyMessage}
          setReplyMessage={setReplyMessage}
          onTyping={() => socket.emit("typing", { senderName: currentUser.name })}
          onStopTyping={() => socket.emit("stopTyping")}
          onSend={async (data) => {
            const body = {
              senderName: currentUser.name,
              senderEmail: currentUser.email,
              senderRole: currentUser.role,
              receiverName: selectedChat.type === "private" ? selectedChat.user.name : "",
              receiverEmail: selectedChat.type === "private" ? selectedChat.user.email : "",
              chatType: selectedChat.type,
              message: data.message,
              image: data.image || "",
              file: data.file || "",
              voice: "",
              replyTo: data.replyTo ? data.replyTo._id : null,
            };
            try {
              const res = await fetch("https://ebay-dashboard-z7h2.onrender.com/api/chat/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              });
              const result = await res.json();
              if (result.success) {
                socket.emit("sendMessage", result.chat);
                setMessages((prev) => [...prev, result.chat]);
              }
              setReplyMessage(null);
            } catch (err) {
              console.error(err);
            }
          }}
        />
      </div>
    </div>
  );
}
