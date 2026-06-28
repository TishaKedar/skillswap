const express = require("express");
const { createSwapRequest, getMySwaps, updateSwapStatus } = require("../controllers/swapController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", createSwapRequest);
router.get("/", getMySwaps);
router.patch("/:id", updateSwapStatus);

module.exports = router;
