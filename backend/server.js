const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const compression = require("compression");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(compression());
app.use(express.json({ limit: "2mb" }));

// =========================
// Routes
// =========================

const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const stockRoutes = require("./routes/stockRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const taskRoutes = require("./routes/taskRoutes");
const noteRoutes = require("./routes/noteRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const chatRoutes = require("./routes/chatRoutes");
const ebayRoutes = require("./routes/ebayRoutes");
const templateRoutes = require("./routes/templateRoutes");
// =========================
// MongoDB
// =========================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

// =========================
// Socket.IO
// =========================

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Socket Connected:", socket.id);

  // User joins
  socket.on("join", (email) => {
    onlineUsers.set(email, socket.id);

    io.emit(
      "onlineUsers",
      Array.from(onlineUsers.keys())
    );

    console.log(email, "joined");
  });

  // Typing
  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");
  });

  // Live Message
socket.on("sendMessage", (message) => {
  if (message.chatType === "group") {
    // Group messages go to everyone online, not just sender/receiver.
    io.emit("newMessage", message);
    return;
  }

  const senderSocket = onlineUsers.get(message.senderEmail);
  const receiverSocket = onlineUsers.get(message.receiverEmail);

  // Sender ko message bhejo
  if (senderSocket) {
    io.to(senderSocket).emit("newMessage", message);
  }

  // Receiver ko message bhejo
  if (receiverSocket && receiverSocket !== senderSocket) {
    io.to(receiverSocket).emit("newMessage", message);
  }
});

  // Task assignment — relayed to everyone online; each client decides
  // locally whether the task was assigned to them.
  socket.on("taskAssigned", (data) => {
    socket.broadcast.emit("taskAssigned", data);
  });

  // A message was deleted (for everyone) — tell other open chat windows
  // to drop it live instead of waiting for their next reload.
  socket.on("deleteMessage", (data) => {
    socket.broadcast.emit("messageDeleted", data);
  });

  // A message was marked seen — relay so the sender's ticks update live.
  socket.on("messageSeen", (data) => {
    socket.broadcast.emit("messageSeenUpdate", data);
  });

  // A message was edited — relay so other open chat windows update live.
  socket.on("editMessage", (data) => {
    socket.broadcast.emit("messageEdited", data);
  });

  // Seen
  socket.on("seen", (data) => {
    io.emit("messageSeen", data);
  });

  // Disconnect
  socket.on("disconnect", () => {
    for (const [email, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(email);
        break;
      }
    }

    io.emit(
      "onlineUsers",
      Array.from(onlineUsers.keys())
    );

    console.log("Socket Disconnected");
  });
});

// =========================
// API Routes
// =========================

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ebay", ebayRoutes);
app.use("/api/templates", templateRoutes);

// =========================
// Root
// =========================

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

// =========================
// Server
// =========================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});