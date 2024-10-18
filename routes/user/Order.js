const express = require("express");
const router = express.Router();
const {
  userOrder,
  getUserOrder,
  getAllOrder,
} = require("../../controllers/user/Order");
const path = require("path");
const multer = require("multer");

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/image_data/");
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
  "/create-order",
  upload.fields([
    { name: "upload_gatepass", maxCount: 1 },
    { name: "upload_invitation", maxCount: 1 },
  ]),
  userOrder
);
router.get("/get-a-order/:id", getUserOrder);
router.get("/getallorder", getAllOrder);

module.exports = router;
