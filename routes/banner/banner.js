// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const {
//   createBanner,
//   getBanners,
//   deleteBanners,
// } = require("../../controllers/banner/banner");

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/banners/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// router.post("/createbanner", upload.single("banner_image"), createBanner);
// router.get("/get-all-banners", getBanners);
// router.delete("/deletebanner/:id", deleteBanners);

// module.exports = router;

const express = require("express");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const router = express.Router();

const {
  createBanner,
  getBanners,
  deleteBanners,
} = require("../../controllers/banner/banner");

// Configure AWS S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Custom middleware for S3 upload
const uploadToS3 = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      throw new Error("No file provided");
    }

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME, // Bucket name
      Key: `banners/${Date.now()}-${file.originalname}`, // Object key in S3
      Body: file.buffer, // File content
      ContentType: file.mimetype, // MIME type of the file
    };

    // Upload to S3 using @aws-sdk/lib-storage
    const uploader = new Upload({
      client: s3,
      params: uploadParams,
    });

    const uploadResult = await uploader.done();
    req.body.bannerImg = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    next();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Image upload failed", details: error.message });
  }
};

// Routes
router.post(
  "/createbanner",
  upload.single("banner_image"),
  uploadToS3,
  createBanner
);
router.get("/get-all-banners", getBanners);
router.delete("/deletebanner/:id", deleteBanners);

module.exports = router;
