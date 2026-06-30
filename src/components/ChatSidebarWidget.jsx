import { Search, Hash, Users } from "lucide-react";
import { useMemo, useState } from "react";

export default function ChatSidebarWidget({
  users,
  currentUser,
  selectedChat,
  setSelectedChat,
}) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    return users
      .filter(
        (u) =>
          u.email !== currentUser?.email &&
          u.name?.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (a.online === b.online) {
          return a.name.localeCompare(b.name);
        }
        return b.online - a.online;
      });
  }, [users, search, currentUser]);

  return (
    <div className="w-[140px] flex-shrink-0 flex flex-col border-r border-white/10 bg-slate-900/60 backdrop-blur-sm">

      {/* Search */}
      <div className="p-2 border-b border-white/10">
        <div className="relative">
          <Search
            size={11}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/60 text-white placeholder-slate-500 text-[11px] pl-6 pr-2 py-1.5 rounded-lg outline-none border border-white/5 focus:ring-1 focus:ring-violet-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1.5 space-y-1 px-1.5">

        {/* Group */}
        <button
          onClick={() =>
            setSelectedChat({
              type: "group",
              id: "general",
            })
          }
          className={`w-full flex flex-col items-center gap-1 p-2 rounded-xl transition ${
            selectedChat?.type === "group"
              ? "bg-violet-600/30 ring-1 ring-violet-500/40"
              : "hover:bg-white/5"
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-violet-600/30 flex items-center justify-center">
            <Hash
              size={16}
              className="text-violet-400"
            />
          </div>

          <span className="text-[10px] text-slate-300">
            General
          </span>
        </button>

        {/* Divider */}

        <div className="px-2 pt-2">
          <p className="text-[9px] uppercase tracking-widest text-slate-500">
            Direct Messages
          </p>
        </div>

        {/* Users */}

        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <button
              key={user.email}
              onClick={() =>
                setSelectedChat({
                  type: "private",
                  id: user.email,
                  user,
                })
              }
              className={`w-full flex flex-col items-center gap-1 p-2 rounded-xl transition ${
                selectedChat?.id === user.email
                  ? "bg-violet-600/30 ring-1 ring-violet-500/40"
                  : "hover:bg-white/5"
              }`}
            >
              <div className="relative">

                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>

                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                    user.online
                      ? "bg-emerald-400"
                      : "bg-slate-600"
                  }`}
                />

                {user.unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1 border border-slate-900">
                    {user.unread > 9
                      ? "9+"
                      : user.unread}
                  </span>
                )}
              </div>

              <span className="text-[10px] text-slate-300 truncate w-full text-center">
                {user.name}
              </span>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <Users
              size={22}
              className="text-slate-600 mb-2"
            />

            <p className="text-[10px] text-slate-500">
              No users found
            </p>
          </div>
        )}
      </div>

      {/* Me */}

      <div className="border-t border-white/10 p-2">
        <div className="flex flex-col items-center gap-1">

          <div className="relative">

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold">
              {currentUser?.name?.charAt(0)?.toUpperCase()}
            </div>

            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />

          </div>

          <span className="text-[9px] text-slate-400 truncate w-full text-center">
            {currentUser?.name}
          </span>

        </div>
      </div>
    </div>
  );
}