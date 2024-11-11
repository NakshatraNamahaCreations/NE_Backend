const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createBanner,
  getBanners,
  deleteBanners,
} = require("../../controllers/banner/banner");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/banners/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/createbanner", upload.single("banner_image"), createBanner);
router.get("/get-all-banners", getBanners);
router.delete("/deletebanner/:id", deleteBanners);

module.exports = router;
