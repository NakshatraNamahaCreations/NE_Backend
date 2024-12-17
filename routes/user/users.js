const express = require("express");
const { refreshToken } = require("../../controllers/authController");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  getAllUser,
  updateProfile,
  addAddress,
  deleteUser,
} = require("../../controllers/user/userController");
// const authMiddleware = require("../../controllers/middleware/authMiddleware");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadToS3 = async (req, res, next) => {
  try {
    if (!req.files) {
      throw new Error("No files provided");
    }

    const uploadedFiles = {};
    for (const [key, files] of Object.entries(req.files)) {
      uploadedFiles[key] = await Promise.all(
        files.map(async (file) => {
          const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `user_document/${Date.now()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
          };

          const uploader = new Upload({
            client: s3,
            params: uploadParams,
          });

          const uploadResult = await uploader.done();
          return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
        })
      );
    }
    req.body.pan_front_image = uploadedFiles.pan_front_image
      ? uploadedFiles.pan_front_image[0]
      : null;
    req.body.pan_back_image = uploadedFiles.pan_back_image
      ? uploadedFiles.pan_back_image[0]
      : null;
    next();
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({ error: "File upload failed", details: error.message });
  }
};

// Route for refreshing token
router.post("/refresh-token", refreshToken);
router.post("/user-register", register);
router.post("/user-login", login);
router.get("/get-all-user", getAllUser);
router.get("/get-user-profile/:id", getProfile);
router.put(
  "/update-profile/:id",

  upload.fields([
    { name: "pan_front_image", maxCount: 1 },
    { name: "pan_back_image", maxCount: 1 },
  ]),
  uploadToS3,
  updateProfile
);
router.put("/save-delivery-address/:id", addAddress);
router.delete("/profile", deleteUser);

module.exports = router;
