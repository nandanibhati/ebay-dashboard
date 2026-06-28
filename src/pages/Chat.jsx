import { useEffect, useState } from "react";
import socket from "../socket";
import OnlineUsers from "../components/chat/OnlineUsers";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import ChatInput from "../components/chat/ChatInput";

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

  const [selectedChat, setSelectedChat] = useState({
    type: "group",
    id: "general",
  });

  // ==========================
  // Load Employees
  // ==========================

  useEffect(() => {
    fetch(
      "https://ebay-dashboard-z7h2.onrender.com/api/auth/employees"
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;

        setUsers(
          data.employees.map((emp) => ({
            ...emp,
            online: false,
            unread: 0,
          }))
        );
      });
  }, []);

  // ==========================
  // Socket Join
  // ==========================

  useEffect(() => {
    if (!currentUser.email) return;

    socket.emit("join", currentUser.email);
  }, []);

  // ==========================
  // Socket Events
  // ==========================

  useEffect(() => {
    socket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("onlineUsers", (list) => {
      setOnlineUsers(list);

      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          online: list.includes(u.email),
        }))
      );
    });

    socket.on("typing", (data) => {
      setTypingUser(data.senderName);
    });

    socket.on("stopTyping", () => {
      setTypingUser("");
    });

    return () => {
      socket.off("newMessage");
      socket.off("onlineUsers");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, []);

  // ==========================
  // Load Messages
  // ==========================

  useEffect(() => {
    if (selectedChat.type === "group") {
      loadGroupMessages();
    } else {
      loadPrivateMessages();
    }
  }, [selectedChat]);

  async function loadGroupMessages() {
    const res = await fetch(
      "https://ebay-dashboard-z7h2.onrender.com/api/chat/group"
    );

    const data = await res.json();

    if (data.success) {
      setMessages(data.chats);
    }
  }

  async function loadPrivateMessages() {
    const res = await fetch(
      `https://ebay-dashboard-z7h2.onrender.com/api/chat/private/${currentUser.email}/${selectedChat.user.email}`
    );

    const data = await res.json();

    if (data.success) {
      setMessages(data.chats);
    }
  }

  return (
    <div className="h-screen flex bg-slate-100">

      <ChatSidebar
        users={users}
        onlineUsers={onlineUsers}
        currentUser={currentUser}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
      />

      <div className="flex-1 flex flex-col">

  <ChatHeader
    selectedChat={selectedChat}
    typingUser={typingUser}
  />

  <OnlineUsers
    users={users}
    selectedChat={selectedChat}
    setSelectedChat={setSelectedChat}
  />

  <MessageList
    messages={messages}
    currentUser={currentUser}
    onReply={(msg) => setReplyMessage(msg)}
    onEdit={(msg) => {
      console.log("Edit", msg);
    }}
    onDelete={async (msg) => {
      await fetch(
        `https://ebay-dashboard-z7h2.onrender.com/api/chat/${msg._id}`,
        {
          method: "DELETE",
        }
      );

      setMessages((prev) =>
        prev.filter((m) => m._id !== msg._id)
      );
    }}
    onReaction={(msg) => {
      console.log("Reaction", msg);
    }}
  />

 <ChatInput
  replyMessage={replyMessage}
  setReplyMessage={setReplyMessage}
  onTyping={() => {
    socket.emit("typing", {
      senderName: currentUser.name,
    });
  }}
  onStopTyping={() => {
    socket.emit("stopTyping");
  }}
  onSend={async (data) => {
    const body = {
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      senderRole: currentUser.role,

      receiverName:
        selectedChat.type === "private"
          ? selectedChat.user.name
          : "",

      receiverEmail:
        selectedChat.type === "private"
          ? selectedChat.user.email
          : "",

      chatType: selectedChat.type,

      message: data.message,

      image: data.image || "",

      file: data.file || "",

      voice: "",

      replyTo: data.replyTo
        ? data.replyTo._id
        : null,
    };

    try {
      const res = await fetch(
        "https://ebay-dashboard-z7h2.onrender.com/api/chat/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const result = await res.json();

      if (result.success) {
        socket.emit("sendMessage", result.chat);

        setMessages((prev) => [
          ...prev,
          result.chat,
        ]);
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