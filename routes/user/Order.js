const express = require("express");
const router = express.Router();
const {
  userOrder,
  rescheduleOrder,
  getUserOrder,
  getAllOrder,
  getSellerProducts,
  getOrderByOrderId,
  cancelOrder,
  returnOrder,
  getCancelledOrder,
  getRescheduledOrder,
  addDeliveryImges,
  deliveryOrder,
  raiseTickets, //update in server
} = require("../../controllers/user/Order");
const path = require("path");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

// // Configure storage for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/image_data/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

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
    // console.log("req.files:", req.files);
    const uploadedFiles = {};
    for (const [key, files] of Object.entries(req.files)) {
      uploadedFiles[key] = await Promise.all(
        files.map(async (file) => {
          const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `order_data/${Date.now()}-${file.originalname}`,
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
    // console.log("Uploaded files:", uploadedFiles);

    // Assign the uploaded URLs to req.body fields
    req.body.upload_gatepass = uploadedFiles.upload_gatepass
      ? uploadedFiles.upload_gatepass[0] // Only one file expected
      : null;
    req.body.upload_invitation = uploadedFiles.upload_invitation
      ? uploadedFiles.upload_invitation[0] // Only one file expected
      : null;

    next();
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({ error: "File upload failed", details: error.message });
  }
};

const uploadDeliveryiMAGES = async (req, res, next) => {
  try {
    if (!req.files) {
      throw new Error("No files provided");
    }
    // console.log("req.files:", req.files);
    const uploadedFiles = {};
    for (const [key, files] of Object.entries(req.files)) {
      uploadedFiles[key] = await Promise.all(
        files.map(async (file) => {
          const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `delivery_setup/${Date.now()}-${file.originalname}`,
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
    // console.log("Uploaded files:", uploadedFiles);

    // Assign the uploaded URLs to req.body fields
    req.body.image_url = uploadedFiles.image_url
      ? uploadedFiles.image_url[0] // Only one file expected
      : null;

    next();
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({ error: "File upload failed", details: error.message });
  }
};

router.post(
  "/create-order",
  upload.fields([
    { name: "upload_gatepass", maxCount: 1 },
    { name: "upload_invitation", maxCount: 1 },
  ]),
  uploadToS3,
  userOrder
);
router.put(
  "/reschedule-order/:id",
  upload.fields([
    { name: "upload_gatepass", maxCount: 1 },
    { name: "upload_invitation", maxCount: 1 },
  ]),
  uploadToS3,
  rescheduleOrder
);
router.get("/get-a-order/:id", getUserOrder);
router.get("/get-vendor-order/:id", getSellerProducts);
router.get("/get-cancelled-events", getCancelledOrder);
router.get("/getallorder", getAllOrder);
router.get("/get-order-by-order-id/:id", getOrderByOrderId);
router.put("/cancel-order/:id", cancelOrder);
router.get("/get-rescheduled-events", getRescheduledOrder);
router.put("/return-order/:id", returnOrder);
router.put("/raise-ticket/:id", raiseTickets); //update in server
router.put(
  "/add-deliverey-setup/:id",
  upload.fields([{ name: "image_url", maxCount: 1 }]),
  uploadDeliveryiMAGES,
  addDeliveryImges
);
router.put("/delivery-order/:id", deliveryOrder);
module.exports = router;
