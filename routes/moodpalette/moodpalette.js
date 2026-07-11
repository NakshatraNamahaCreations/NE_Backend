const express = require("express");
const multer = require("multer");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const router = express.Router();

const {
  createPaletteItem,
  getAllPaletteItems,
  getActivePaletteItems,
  updatePaletteItem,
  togglePaletteItem,
  deletePaletteItem,
} = require("../../controllers/moodpalette/moodpalette");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload the item image to S3 (optional — edits may not re-pick a file).
const uploadToS3 = async (req, res, next) => {
  try {
    if (!req.file) return next();
    const key = `mood_palette/${Date.now()}-${req.file.originalname}`;
    const uploader = new Upload({
      client: s3,
      params: {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      },
    });
    await uploader.done();
    req.body.image = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    next();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Image upload failed", details: error.message });
  }
};

// Admin
router.post("/create", upload.single("image"), uploadToS3, createPaletteItem);
router.get("/get-all", getAllPaletteItems);
router.put("/update/:id", upload.single("image"), uploadToS3, updatePaletteItem);
router.put("/toggle/:id", togglePaletteItem);
router.delete("/delete/:id", deletePaletteItem);

// Public (Website + User App)
router.get("/get-active", getActivePaletteItems);

module.exports = router;
