import {
  Send,
  Smile,
  Paperclip,
  Image,
  Mic,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

const EMOJIS = [
  "😀",
  "😁",
  "😂",
  "🤣",
  "😊",
  "😍",
  "😎",
  "😭",
  "😡",
  "👍",
  "👎",
  "👏",
  "🙏",
  "🔥",
  "❤️",
  "🎉",
  "💜",
  "😴",
  "🤝",
  "👌",
];

export default function MessageInput({
  onSend,
  replyMessage,
  setReplyMessage,
  onTyping,
  onStopTyping,
}) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);

  const imageRef = useRef(null);
  const fileRef = useRef(null);

  const send = () => {
    if (!text.trim() && !image && !file) return;

    onSend({
      message: text,
      image,
      file,
      replyTo: replyMessage,
    });

    setText("");
    setImage(null);
    setFile(null);
    setShowEmoji(false);

    onStopTyping?.();

    if (setReplyMessage) {
      setReplyMessage(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);

    if (e.target.value.trim()) {
      onTyping?.();
    } else {
      onStopTyping?.();
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-white/10 bg-slate-900/60 backdrop-blur-sm">

      {/* Reply Preview */}

      {replyMessage && (
        <div className="mx-3 mt-2.5 px-3 py-2 rounded-xl bg-violet-600/20 border-l-[3px] border-violet-500 flex items-center justify-between gap-2">

          <div className="min-w-0">

            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wide">
              Replying
            </p>

            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {replyMessage.message
               (replyMessage.image && "🖼️ Photo") ||
    (replyMessage.file && "📎 File")}
            </p>

          </div>

          <button
            onClick={() => setReplyMessage(null)}
            className="w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center"
          >
            <X size={11} className="text-slate-400" />
          </button>

        </div>
      )}

      {/* Attachment Preview */}

      {(image || file) && (
        <div className="px-3 pt-2 space-y-2">

          {image && (
            <div className="flex items-center justify-between bg-slate-800 rounded-xl px-3 py-2">

              <span className="text-[11px] text-slate-300">
                🖼 {image.name}
              </span>

              <button
                onClick={() => setImage(null)}
              >
                <X size={12} />
              </button>

            </div>
          )}

          {file && (
            <div className="flex items-center justify-between bg-slate-800 rounded-xl px-3 py-2">

              <span className="text-[11px] text-slate-300">
                📎 {file.name}
              </span>

              <button
                onClick={() => setFile(null)}
              >
                <X size={12} />
              </button>

            </div>
          )}

        </div>
      )}

      {/* Emoji Picker */}

      {showEmoji && (
        <div className="mx-3 mt-2 bg-slate-800 rounded-2xl p-3">

          <div className="grid grid-cols-10 gap-2">

            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setText((prev) => prev + emoji);
                  setShowEmoji(false);
                }}
                className="text-lg hover:scale-125 transition"
              >
                {emoji}
              </button>
            ))}

          </div>

        </div>
      )}
            {/* Input Row */}
      <div className="flex items-center gap-1.5 px-3 py-2.5">

        {/* Emoji */}
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
            showEmoji
              ? "bg-violet-600/30 text-violet-400"
              : "hover:bg-white/10 text-slate-400 hover:text-violet-400"
          }`}
        >
          <Smile size={17} />
        </button>

        {/* Image */}
        <button
          onClick={() => imageRef.current?.click()}
          className="w-8 h-8 rounded-full hover:bg-white/10 text-slate-400 hover:text-violet-400 flex items-center justify-center transition"
        >
          <Image size={17} />
        </button>

        {/* File */}
        <button
          onClick={() => fileRef.current?.click()}
          className="w-8 h-8 rounded-full hover:bg-white/10 text-slate-400 hover:text-violet-400 flex items-center justify-center transition"
        >
          <Paperclip size={17} />
        </button>

        <input
          hidden
          ref={imageRef}
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />

        <input
          hidden
          ref={fileRef}
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        {/* Message Input */}
        <input
          value={text}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-slate-800/60 border border-white/10 text-slate-100 placeholder-slate-500 text-[13px] rounded-xl px-3.5 py-2 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30"
        />

        {/* Voice (UI only for now) */}
        <button
          className="w-8 h-8 rounded-full hover:bg-white/10 text-slate-400 hover:text-violet-400 flex items-center justify-center transition"
        >
          <Mic size={17} />
        </button>

        {/* Send */}
        <button
          onClick={send}
          className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white flex items-center justify-center shadow-lg transition"
        >
          <Send size={16} />
        </button>
      </div>

      {/* Typing Text */}
      {text.trim() && (
        <p className="px-4 pb-2 text-[10px] text-violet-400/70 animate-pulse">
          Typing...
        </p>
      )}
    </div>
  );
}