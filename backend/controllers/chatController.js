const Message = require("../models/Message");
const SwapRequest = require("../models/SwapRequest");

// GET /api/chat/:swapId/messages
const getMessages = async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.swapId);
    if (!swap) return res.status(404).json({ message: "Swap not found" });

    const uid = String(req.user._id);
    if (String(swap.fromUser) !== uid && String(swap.toUser) !== uid) {
      return res.status(403).json({ message: "Not part of this swap" });
    }

    // Mark all messages as read by current user
    await Message.updateMany(
      { swapId: req.params.swapId, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    const messages = await Message.find({ swapId: req.params.swapId })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Could not load messages", error: err.message });
  }
};

// POST /api/chat/:swapId/messages  (REST fallback — realtime goes via socket)
const postMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "text is required" });

    const swap = await SwapRequest.findById(req.params.swapId);
    if (!swap) return res.status(404).json({ message: "Swap not found" });

    const uid = String(req.user._id);
    if (String(swap.fromUser) !== uid && String(swap.toUser) !== uid) {
      return res.status(403).json({ message: "Not part of this swap" });
    }

    const msg = await Message.create({
      swapId: req.params.swapId,
      sender: req.user._id,
      text: text.trim(),
      readBy: [req.user._id],
    });

    const populated = await msg.populate("sender", "name avatar");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Could not send message", error: err.message });
  }
};

module.exports = { getMessages, postMessage };
