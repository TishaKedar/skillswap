const express = require("express");
const { updateProfile, getAllUsers, getUserById, getMatches } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect); // every route below requires login

router.put("/me", updateProfile);
router.get("/matches", getMatches);
router.get("/", getAllUsers);
router.get("/:id", getUserById);

module.exports = router;
