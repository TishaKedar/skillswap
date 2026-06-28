const mongoose = require("mongoose");

const swapRequestSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    skillOffered: { type: String, required: true }, // skill fromUser will teach
    skillRequested: { type: String, required: true }, // skill fromUser wants to learn
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SwapRequest", swapRequestSchema);
