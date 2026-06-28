const express = require("express");
const { getMessages, postMessage } = require("../controllers/chatController");
const { protect } = require("../middleware/auth");
const router = express.Router();
router.use(protect);
router.get("/:swapId/messages", getMessages);
router.post("/:swapId/messages", postMessage);
module.exports = router;
