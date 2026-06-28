import {
  Phone,
  Video,
  Search,
  MoreVertical,
  Circle,
} from "lucide-react";

export default function ChatHeader({
  selectedChat,
  typingUser,
}) {
  const isGroup =
    selectedChat?.type === "group";

  return (
    <div className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between">

      {/* Left */}

      <div className="flex items-center gap-4">

        {isGroup ? (
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">

            #

          </div>
        ) : (
          <div className="relative">

            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">

              {selectedChat?.user?.name?.charAt(0)}

            </div>

            <Circle
              size={10}
              fill={
                selectedChat?.user?.online
                  ? "#22c55e"
                  : "#94a3b8"
              }
              className="absolute bottom-0 right-0 text-white"
            />

          </div>
        )}

        <div>

          <h2 className="text-lg font-bold text-slate-800">

            {isGroup
              ? "General Team Chat"
              : selectedChat?.user?.name}

          </h2>

          <p className="text-sm text-slate-500">

            {isGroup ? (
              "Everyone can chat here"
            ) : typingUser ? (
              <span className="text-violet-600 font-medium">
                Typing...
              </span>
            ) : selectedChat?.user?.online ? (
              <span className="text-emerald-500">
                ● Online
              </span>
            ) : (
              "Offline"
            )}

          </p>

        </div>

      </div>

      {/* Right */}

      <div className="flex items-center gap-3">

        <button className="w-11 h-11 rounded-xl hover:bg-slate-100 flex items-center justify-center transition">

          <Search
            size={20}
            className="text-slate-600"
          />

        </button>

        <button className="w-11 h-11 rounded-xl hover:bg-slate-100 flex items-center justify-center transition">

          <Phone
            size={20}
            className="text-slate-600"
          />

        </button>

        <button className="w-11 h-11 rounded-xl hover:bg-slate-100 flex items-center justify-center transition">

          <Video
            size={20}
            className="text-slate-600"
          />

        </button>

        <button className="w-11 h-11 rounded-xl hover:bg-slate-100 flex items-center justify-center transition">

          <MoreVertical
            size={20}
            className="text-slate-600"
          />

        </button>

      </div>

    </div>
  );
}