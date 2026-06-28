import { Circle } from "lucide-react";

export default function OnlineUsers({
  users = [],
  selectedChat,
  setSelectedChat,
}) {
  const online = users.filter(
    (u) => u.online
  );

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">

      <h3 className="text-sm font-semibold text-slate-700 mb-4">
        Online Users ({online.length})
      </h3>

      <div className="flex gap-4 overflow-x-auto">

        {online.length === 0 && (
          <p className="text-sm text-slate-400">
            No one is online
          </p>
        )}

        {online.map((user) => (
          <button
            key={user.email}
            onClick={() =>
              setSelectedChat({
                type: "private",
                id: user.email,
                user,
              })
            }
            className={`flex flex-col items-center min-w-[70px] transition ${
              selectedChat?.id === user.email
                ? "scale-105"
                : ""
            }`}
          >

            <div className="relative">

              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">

                {user.name?.charAt(0)}

              </div>

              <Circle
                size={12}
                fill="#22c55e"
                className="absolute bottom-0 right-0 text-white"
              />

            </div>

            <p className="text-xs mt-2 text-center truncate w-full">
              {user.name}
            </p>

          </button>
        ))}

      </div>

    </div>
  );
}