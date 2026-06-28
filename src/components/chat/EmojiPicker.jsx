const emojis = [
  "😀",
  "😁",
  "😂",
  "🤣",
  "😊",
  "😍",
  "😘",
  "😎",
  "😭",
  "😡",
  "👍",
  "👎",
  "👏",
  "🙏",
  "🔥",
  "❤️",
  "💙",
  "💚",
  "💛",
  "💜",
  "🎉",
  "🤝",
  "👌",
  "😴",
];

export default function EmojiPicker({
  onSelect,
}) {
  return (
    <div className="absolute bottom-16 left-0 w-72 rounded-2xl border border-slate-200 bg-white shadow-xl p-4 z-50">

      <div className="grid grid-cols-6 gap-3">

        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() =>
              onSelect(emoji)
            }
            className="text-2xl hover:scale-125 transition"
          >
            {emoji}
          </button>
        ))}

      </div>

    </div>
  );
}