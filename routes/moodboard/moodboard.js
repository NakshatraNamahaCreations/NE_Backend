const express = require("express");
const router = express.Router();
const {
  saveMoodboard,
  getMyMoodboards,
  deleteMoodboard,
} = require("../../controllers/moodboard/moodboard");

router.post("/save-moodboard", saveMoodboard);
router.get("/get-my-moodboards/:userId", getMyMoodboards);
router.delete("/delete-moodboard/:id", deleteMoodboard);

module.exports = router;
