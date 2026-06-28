const Review = require("../models/Review");
const SwapRequest = require("../models/SwapRequest");
const Notification = require("../models/Notification");

// POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { swapId, rating, comment } = req.body;
    if (!swapId || !rating) return res.status(400).json({ message: "swapId and rating required" });

    const swap = await SwapRequest.findById(swapId).populate("fromUser toUser");
    if (!swap) return res.status(404).json({ message: "Swap not found" });
    if (swap.status !== "accepted") return res.status(400).json({ message: "Can only review accepted swaps" });

    const uid = String(req.user._id);
    if (String(swap.fromUser._id) !== uid && String(swap.toUser._id) !== uid) {
      return res.status(403).json({ message: "Not part of this swap" });
    }

    const revieweeId = String(swap.fromUser._id) === uid ? swap.toUser._id : swap.fromUser._id;

    const existing = await Review.findOne({ swapId, reviewer: req.user._id });
    if (existing) return res.status(409).json({ message: "You already reviewed this swap" });

    const review = await Review.create({
      swapId, reviewer: req.user._id, reviewee: revieweeId, rating, comment: comment || "",
    });

    // notify reviewee
    await Notification.create({
      user: revieweeId,
      type: "new_review",
      title: "You got a review!",
      body: `${req.user.name} gave you ${rating} star${rating !== 1 ? "s" : ""}.`,
      relatedId: review._id,
    });

    const io = req.app.get("io");
    if (io) {
      io.to(String(revieweeId)).emit("notification", {
        type: "new_review",
        title: "You got a review!",
        body: `${req.user.name} gave you ${rating} star${rating !== 1 ? "s" : ""}.`,
      });
    }

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Already reviewed" });
    res.status(500).json({ message: "Could not create review", error: err.message });
  }
};

// GET /api/reviews/user/:userId
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate("reviewer", "name avatar")
      .sort({ createdAt: -1 });

    const avg = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

    res.json({ reviews, avgRating: Math.round(avg * 10) / 10, count: reviews.length });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch reviews", error: err.message });
  }
};

// GET /api/reviews/swap/:swapId  — to check if current user already reviewed
const getSwapReview = async (req, res) => {
  try {
    const review = await Review.findOne({ swapId: req.params.swapId, reviewer: req.user._id });
    res.json(review || null);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch review" });
  }
};

module.exports = { createReview, getUserReviews, getSwapReview };
