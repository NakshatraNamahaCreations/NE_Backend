const express = require("express");
const router = express.Router();
const {
  addOrUpdateProfile,
  getProfile,
  addSocialMediaLink,
  deleteSocialMediaLink,
} = require("../../controllers/master/company_profile");
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/company_profile/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post(
  "/add-profile",
  upload.fields([
    { name: "company_logo", maxCount: 1 },
    { name: "site_favicon", maxCount: 1 },
  ]),
  addOrUpdateProfile
);
router.get("/get-profile", getProfile);
router.put("/add-social-mediaLink/:id", addSocialMediaLink);
router.delete("/link/:id/social-media/:socialMediaId", deleteSocialMediaLink);

module.exports = router;
