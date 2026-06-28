const Notification = require("../models/Notification");

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notes = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch notifications" });
  }
};

// PATCH /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
};

// PATCH /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
};

module.exports = { getNotifications, markAllRead, markRead };
