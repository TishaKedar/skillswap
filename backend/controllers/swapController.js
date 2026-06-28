const SwapRequest = require("../models/SwapRequest");
const Notification = require("../models/Notification");

const notify = async (io, userId, type, title, body, relatedId) => {
  await Notification.create({ user: userId, type, title, body, relatedId });
  if (io) io.to(String(userId)).emit("notification", { type, title, body });
};

// POST /api/swaps
const createSwapRequest = async (req, res) => {
  try {
    const { toUser, skillOffered, skillRequested, message } = req.body;

    if (!toUser || !skillOffered || !skillRequested) {
      return res.status(400).json({ message: "toUser, skillOffered and skillRequested are required" });
    }
    if (toUser === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot send a swap request to yourself" });
    }

    const swap = await SwapRequest.create({
      fromUser: req.user._id, toUser, skillOffered, skillRequested, message,
    });

    const io = req.app.get("io");
    await notify(
      io, toUser, "swap_request",
      "New swap request!",
      `${req.user.name} wants to swap ${skillOffered} for ${skillRequested}.`,
      swap._id
    );

    res.status(201).json(swap);
  } catch (err) {
    res.status(500).json({ message: "Could not create swap request", error: err.message });
  }
};

// GET /api/swaps
const getMySwaps = async (req, res) => {
  try {
    const swaps = await SwapRequest.find({
      $or: [{ fromUser: req.user._id }, { toUser: req.user._id }],
    })
      .populate("fromUser", "name email avatar")
      .populate("toUser", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(swaps);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch swap requests", error: err.message });
  }
};

// PATCH /api/swaps/:id
const updateSwapStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'accepted' or 'rejected'" });
    }

    const swap = await SwapRequest.findById(req.params.id).populate("fromUser toUser");
    if (!swap) return res.status(404).json({ message: "Swap request not found" });
    if (String(swap.toUser._id) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the recipient can respond to this request" });
    }

    swap.status = status;
    await swap.save();

    const io = req.app.get("io");
    const notifType = status === "accepted" ? "swap_accepted" : "swap_rejected";
    const notifTitle = status === "accepted" ? "Swap accepted! 🎉" : "Swap declined";
    const notifBody = status === "accepted"
      ? `${swap.toUser.name} accepted your swap request.`
      : `${swap.toUser.name} declined your swap request.`;

    await notify(io, String(swap.fromUser._id), notifType, notifTitle, notifBody, swap._id);

    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: "Could not update swap request", error: err.message });
  }
};

module.exports = { createSwapRequest, getMySwaps, updateSwapStatus };
