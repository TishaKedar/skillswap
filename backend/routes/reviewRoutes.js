const express = require("express");
const { createReview, getUserReviews, getSwapReview } = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");
const router = express.Router();
router.use(protect);
router.post("/", createReview);
router.get("/user/:userId", getUserReviews);
router.get("/swap/:swapId", getSwapReview);
module.exports = router;
