require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");
const User = require("./models/User");
const Message = require("./models/Message");
const Notification = require("./models/Notification");
const SwapRequest = require("./models/SwapRequest");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const swapRoutes = require("./routes/swapRoutes");
const chatRoutes = require("./routes/chatRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const server = http.createServer(app);

const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

const io = new Server(server, {
  cors: { origin: CORS_ORIGIN, methods: ["GET", "POST"] },
});

app.set("io", io);

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "SkillSwap API is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/swaps", swapRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

// ─── Socket.io ──────────────────────────────────────────────────────────────
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Unauthorized"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(new Error("User not found"));
    socket.user = user;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  const userId = String(socket.user._id);

  // Each user joins their own private room for targeted notifications
  socket.join(userId);

  // Join a swap chat room
  socket.on("join_swap", (swapId) => {
    socket.join(`swap_${swapId}`);
  });

  socket.on("leave_swap", (swapId) => {
    socket.leave(`swap_${swapId}`);
  });

  // Send a chat message in real time
  socket.on("send_message", async ({ swapId, text }) => {
    try {
      if (!text?.trim()) return;

      const swap = await SwapRequest.findById(swapId);
      if (!swap) return;

      const uid = String(socket.user._id);
      if (String(swap.fromUser) !== uid && String(swap.toUser) !== uid) return;

      const msg = await Message.create({
        swapId,
        sender: socket.user._id,
        text: text.trim(),
        readBy: [socket.user._id],
      });

      const populated = await msg.populate("sender", "name avatar");

      // Broadcast to the swap room
      io.to(`swap_${swapId}`).emit("new_message", populated);

      // Notify the other party
      const otherId = String(swap.fromUser) === uid ? String(swap.toUser) : String(swap.fromUser);
      await Notification.create({
        user: otherId,
        type: "new_message",
        title: `Message from ${socket.user.name}`,
        body: text.trim().slice(0, 80),
        relatedId: swapId,
      });
      io.to(otherId).emit("notification", {
        type: "new_message",
        title: `Message from ${socket.user.name}`,
        body: text.trim().slice(0, 80),
        relatedId: swapId,
      });
    } catch (err) {
      console.error("send_message error:", err.message);
    }
  });

  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
