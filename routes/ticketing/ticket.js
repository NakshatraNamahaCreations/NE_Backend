const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createTicket,
  getAllTickets,
  getTicketById,
  getTicketByTicketId,
  changeTicketStatus,
} = require("../../controllers/ticketing/ticket");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

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
      Key: `ticket_raised/${Date.now()}-${file.originalname}`, // Object key in S3
      Body: file.buffer, // File content
      ContentType: file.mimetype, // MIME type of the file
    };

    // Upload to S3 using @aws-sdk/lib-storage
    const uploader = new Upload({
      client: s3,
      params: uploadParams,
    });

    const uploadResult = await uploader.done();
    req.body.attachment_file = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    next();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Image upload failed", details: error.message });
  }
};

// const path = require("path");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/ticket/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage: storage });

router.post(
  "/create-ticket",
  upload.single("attachment_file"),
  uploadToS3,
  createTicket
);
router.get("/get-all-tickets", getAllTickets);
router.get("/get-ticket-by-id/:id", getTicketById);
router.get("/get-ticket-by-ticket-id/:id", getTicketByTicketId);
router.put("/change-status/:id", changeTicketStatus);

module.exports = router;
