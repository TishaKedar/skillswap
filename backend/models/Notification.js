const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["swap_request", "swap_accepted", "swap_rejected", "new_message", "new_review"],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
