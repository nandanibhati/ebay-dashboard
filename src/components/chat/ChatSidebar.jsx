import {
  Search,
  Users,
  Hash,
  Circle,
} from "lucide-react";
import { useMemo, useState } from "react";

export default function ChatSidebar({
  users = [],
  currentUser,
  selectedChat,
  setSelectedChat,
}) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [users, search]);

  return (
    <div className="w-80 h-full bg-white border-r border-slate-200 flex flex-col">

      {/* Header */}

      <div className="px-6 py-5 border-b border-slate-200">

        <h1 className="text-2xl font-bold text-slate-800">
          Team Chat
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Internal communication
        </p>

        {/* Search */}

        <div className="relative mt-5">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 outline-none focus:border-violet-500"
          />

        </div>

      </div>

      {/* Chats */}

      <div className="flex-1 overflow-y-auto">

        {/* General Chat */}

        <button
          onClick={() =>
            setSelectedChat({
              type: "group",
              id: "general",
            })
          }
          className={`w-full flex items-center gap-4 px-5 py-4 transition
          ${
            selectedChat?.id === "general"
              ? "bg-violet-50 border-r-4 border-violet-600"
              : "hover:bg-slate-50"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">

            <Hash
              size={20}
              className="text-violet-600"
            />

          </div>

          <div className="flex-1 text-left">

            <h3 className="font-semibold text-slate-800">
              General
            </h3>

            <p className="text-xs text-slate-500">
              Team Discussion
            </p>

          </div>

          <span className="bg-violet-600 text-white text-xs rounded-full px-2 py-1">
            ALL
          </span>

        </button>

        {/* Employees */}

        <div className="px-5 mt-6 mb-2">

          <p className="text-xs font-semibold tracking-widest uppercase text-slate-400">
            Employees
          </p>

        </div>

        {filteredUsers.map((user) => (
          <button
            key={user.email}
            onClick={() =>
              setSelectedChat({
                type: "private",
                id: user.email,
                user,
              })
            }
            className={`w-full flex items-center gap-4 px-5 py-4 transition
            ${
              selectedChat?.id === user.email
                ? "bg-violet-50 border-r-4 border-violet-600"
                : "hover:bg-slate-50"
            }`}
          >

            {/* Avatar */}

            <div className="relative">

              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold">

                {user.name?.charAt(0)}

              </div>

              <Circle
                size={10}
                fill={
                  user.online
                    ? "#22c55e"
                    : "#94a3b8"
                }
                className="absolute bottom-0 right-0 text-white"
              />

            </div>

            {/* User */}

            <div className="flex-1 text-left">

              <h3 className="font-semibold text-slate-800">
                {user.name}
              </h3>

              <p className="text-xs text-slate-500">

                {user.online
                  ? "Online"
                  : "Offline"}

              </p>

            </div>
                        {/* Unread Count */}

            {user.unread > 0 && (
              <div className="flex flex-col items-end gap-2">

                <span className="bg-violet-600 text-white text-xs font-semibold rounded-full min-w-[24px] h-6 flex items-center justify-center px-2">
                  {user.unread}
                </span>

                <span className="text-[10px] text-slate-400">
                  New
                </span>

              </div>
            )}

          </button>
        ))}

        {/* Empty State */}

        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 px-6">

            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">

              <Users
                size={36}
                className="text-slate-400"
              />

            </div>

            <h3 className="mt-5 font-semibold text-slate-700">
              No Employee Found
            </h3>

            <p className="text-sm text-slate-400 mt-2 text-center">
              Try searching with another name.
            </p>

          </div>
        )}

      </div>

      {/* Footer */}

      <div className="border-t border-slate-200 p-5 bg-slate-50">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold">

            {currentUser?.name?.charAt(0)}

          </div>

          <div className="flex-1">

            <h3 className="font-semibold text-slate-800">
              {currentUser?.name}
            </h3>

            <p className="text-xs text-emerald-500 font-medium">

              ● Online

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}