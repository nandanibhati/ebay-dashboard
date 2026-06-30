import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import socket from "../socket";

import FloatingChatButton from "./FloatingChatButton";
import ChatPopup from "./ChatPopup";
import NotificationToast from "./NotificationToast";

const API =
  import.meta.env.VITE_API_URL ||
  "https://ebay-dashboard-z7h2.onrender.com/api";

// Notification Sound
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext ||
      window.webkitAudioContext)();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 880;
    osc.type = "sine";

    gain.gain.setValueAtTime(
      0.15,
      ctx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + 0.3
    );

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] =
    useState(false);

  const [isMinimized, setIsMinimized] =
    useState(false);

  const [users, setUsers] =
    useState([]);

  const [messages, setMessages] =
    useState([]);

  const [replyMessage, setReplyMessage] =
    useState(null);

  const [typingUser, setTypingUser] =
    useState("");

  const [toast, setToast] =
    useState(null);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [selectedChat, setSelectedChat] =
    useState({
      type: "group",
      id: "general",
    });

  // Refs
  const isOpenRef = useRef(false);
  const isMinimizedRef = useRef(false);
  const selectedChatRef = useRef(null);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    isMinimizedRef.current =
      isMinimized;
  }, [isMinimized]);

  useEffect(() => {
    selectedChatRef.current =
      selectedChat;
  }, [selectedChat]);

  // Current User
  const currentUser = useMemo(
    () => ({
      name:
        localStorage.getItem(
          "employeeName"
        ) ||
        localStorage.getItem("name"),

      email:
        localStorage.getItem(
          "employeeEmail"
        ) ||
        localStorage.getItem("email"),

      role:
        localStorage.getItem("role"),
    }),
    []
  );
    // Load Employees
  useEffect(() => {
    if (!currentUser.email) return;

    fetch(`${API}/auth/employees`)
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
      })
      .catch(console.error);
  }, [currentUser.email]);

  // Join Socket
  useEffect(() => {
    if (!currentUser.email) return;

    socket.emit("join", currentUser.email);
  }, [currentUser.email]);

  // Socket Events
  useEffect(() => {
    const handleOnlineUsers = (onlineList) => {
      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          online: onlineList.includes(u.email),
        }))
      );
    };

    const handleTyping = (data) => {
      if (data.senderName !== currentUser.name) {
        setTypingUser(data.senderName);
      }
    };

    const handleStopTyping = () => {
      setTypingUser("");
    };

    const handleNewMessage = (message) => {
      const currentChat = selectedChatRef.current;

      const chatOpen =
        isOpenRef.current &&
        !isMinimizedRef.current;

      const belongsToCurrentChat =
        (currentChat.type === "group" &&
          message.chatType === "group") ||
        (currentChat.type === "private" &&
          ((message.senderEmail ===
            currentChat.user?.email &&
            message.receiverEmail ===
              currentUser.email) ||
            (message.senderEmail ===
              currentUser.email &&
              message.receiverEmail ===
                currentChat.user?.email)));

      if (belongsToCurrentChat && chatOpen) {
        setMessages((prev) => {
          if (
            prev.some(
              (m) => m._id === message._id
            )
          ) {
            return prev;
          }

          return [...prev, message];
        });
      }

      // Notification
      if (
        message.senderEmail !==
        currentUser.email
      ) {
        setToast(message);

        setUnreadCount((prev) => prev + 1);

        playNotificationSound();

        if (
          message.chatType === "private"
        ) {
          setUsers((prev) =>
            prev.map((u) =>
              u.email ===
              message.senderEmail
                ? {
                    ...u,
                    unread:
                      (u.unread || 0) + 1,
                  }
                : u
            )
          );
        }
      }
    };

    socket.on(
      "onlineUsers",
      handleOnlineUsers
    );

    socket.on(
      "typing",
      handleTyping
    );

    socket.on(
      "stopTyping",
      handleStopTyping
    );

    socket.on(
      "newMessage",
      handleNewMessage
    );

    return () => {
      socket.off(
        "onlineUsers",
        handleOnlineUsers
      );

      socket.off(
        "typing",
        handleTyping
      );

      socket.off(
        "stopTyping",
        handleStopTyping
      );

      socket.off(
        "newMessage",
        handleNewMessage
      );
    };
  }, [currentUser]);
    // Load Messages
  useEffect(() => {
    if (!isOpen) return;

    setMessages([]);

    if (selectedChat.type === "group") {
      fetch(`${API}/chat/group`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setMessages(data.chats);
          }
        })
        .catch(console.error);
    } else if (selectedChat.user?.email) {
      fetch(
        `${API}/chat/private/${currentUser.email}/${selectedChat.user.email}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setMessages(data.chats);
          }
        })
        .catch(console.error);

      // Clear unread count
      setUsers((prev) =>
        prev.map((u) =>
          u.email === selectedChat.user.email
            ? { ...u, unread: 0 }
            : u
        )
      );
    }
  }, [selectedChat, isOpen, currentUser.email]);

  // Clear global unread when popup opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

 // Send Message
const handleSend = useCallback(
  async (data) => {
    const formData = new FormData();

    formData.append("senderName", currentUser.name);
    formData.append("senderEmail", currentUser.email);
    formData.append("senderRole", currentUser.role);

    formData.append(
      "receiverName",
      selectedChat.type === "private"
        ? selectedChat.user.name
        : ""
    );

    formData.append(
      "receiverEmail",
      selectedChat.type === "private"
        ? selectedChat.user.email
        : ""
    );

    formData.append("chatType", selectedChat.type);
    formData.append("message", data.message || "");

    if (data.image) {
      formData.append("image", data.image);
    }

    if (data.file) {
      formData.append("file", data.file);
    }

    formData.append("voice", "");

    if (data.replyTo) {
      formData.append("replyTo", data.replyTo);
    }

    try {
      const res = await fetch(`${API}/chat/send`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        socket.emit("sendMessage", result.chat);
        setReplyMessage(null);
      }
    } catch (err) {
      console.error(err);
    }
  },
  [selectedChat, currentUser]
);

  // Delete
  const handleDelete = useCallback(
    async (msg) => {
      try {
        await fetch(`${API}/chat/${msg._id}`, {
          method: "DELETE",
        });

        setMessages((prev) =>
          prev.filter((m) => m._id !== msg._id)
        );
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  return (
    <>
      <NotificationToast
        toast={toast}
        onClose={() => setToast(null)}
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
          setUnreadCount(0);
        }}
      />

      <ChatPopup
        isOpen={isOpen}
        isMinimized={isMinimized}
        onMinimize={() =>
          setIsMinimized((m) => !m)
        }
        onClose={() => {
          setIsOpen(false);
          setIsMinimized(false);
        }}
        users={users}
        currentUser={currentUser}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        messages={messages}
        typingUser={typingUser}
        replyMessage={replyMessage}
        setReplyMessage={setReplyMessage}
        onSend={handleSend}
        onTyping={() =>
          socket.emit("typing", {
            senderName: currentUser.name,
          })
        }
        onStopTyping={() =>
          socket.emit("stopTyping")
        }
        onDelete={handleDelete}
      />

      <FloatingChatButton
        isOpen={isOpen && !isMinimized}
        unreadCount={unreadCount}
        onClick={() => {
          if (isOpen && !isMinimized) {
            setIsOpen(false);
            setIsMinimized(false);
          } else {
            setIsOpen(true);
            setIsMinimized(false);
            setUnreadCount(0);
          }
        }}
      />
    </>
  );
}