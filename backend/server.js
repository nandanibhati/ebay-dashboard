const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Deploy hone ke baad frontend URL laga dena
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

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
    io.emit("newMessage", message);
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