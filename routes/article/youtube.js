const express = require("express");
const router = express.Router();
const {
  addYoutubeLink,
  getAllVideoLink,
  getActiveLink,
  getLinkById,
  deleteLink,
  activeStatus,
  inActiveStatus,
} = require("../../controllers/article/youtube");

router.post("/add-youtube-link", addYoutubeLink);
router.get("/get-all-youtube-links", getAllVideoLink);
router.get("/get-active-youtube-links", getActiveLink);
router.get("/get-youtube-link-by-id/:id", getLinkById);
router.delete("/delete-youtube-link/:id", deleteLink);
router.put("/youtube-link-active-status/:id", activeStatus);
router.put("/youtube-link-inactive-status/:id", inActiveStatus);

module.exports = router;
