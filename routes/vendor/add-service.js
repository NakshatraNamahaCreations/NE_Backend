const express = require("express");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const router = express.Router();

const {
  addVendorService,
  getAllSerivceList,
  getSerivceByServiceId,
  getAllApprovedServices,
  getServiceByVendorId,
  getVendorService,
  blockServiceAvailability,
  editService,
  writeReviewForService,
  getReviewByServiceId,
  approveServices,
  disApproveService,
  deleteService,
} = require("../../controllers/vendor/add-service");

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

const uploadFields = upload.fields([{ name: "images", maxCount: 6 }]);

const uploadToS3 = async (req, res, next) => {
  try {
    if (!req.files || !req.files.images) {
      return res.status(400).json({ error: "No files provided" });
    }

    console.log("Uploading files to S3...");

    const uploadedFiles = await Promise.all(
      req.files.images.map(async (file) => {
        const fileKey = `additional_images/${Date.now()}-${file.originalname}`;

        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const uploader = new Upload({ client: s3, params: uploadParams });
        await uploader.done();

        return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
      })
    );

    req.body.additional_images = uploadedFiles;
    next();
  } catch (error) {
    console.error("S3 Upload Error:", error);
    res
      .status(500)
      .json({ error: "File upload failed", details: error.message });
  }
};

const uploadToS3IfExists = async (req, res, next) => {
  try {
    if (!req.files || !req.files.images || req.files.images.length === 0) {
      req.body.additional_images = []; // no new uploads
      return next(); // ✅ proceed with only text update
    }
    console.log("Uploading files to S3...");
    const uploadedFiles = await Promise.all(
      req.files.images.map(async (file) => {
        const fileKey = `additional_images/${Date.now()}-${file.originalname}`;
        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const uploader = new Upload({ client: s3, params: uploadParams });
        await uploader.done();

        return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
      })
    );

    req.body.additional_images = uploadedFiles;
    next();
  } catch (error) {
    console.error("S3 Upload Error:", error);
    res
      .status(500)
      .json({ error: "File upload failed", details: error.message });
  }
};

router.post(
  "/add-vendor-service",
  uploadFields,
  uploadToS3,
  addVendorService
  // upload.fields,
  // ([{ name: "images", maxCount: 6 }]),
  // uploadToS3,
  // addVendorService
);
router.get("/get-all-services", getAllSerivceList);
router.get("/get-service-by-serviceid/:id", getSerivceByServiceId);
router.get("/get-approved-services", getAllApprovedServices);
router.get("/get-services-by-vendor-id/:id", getServiceByVendorId);
router.get("/get-vendor-service-vendorid/:id", getVendorService);

router.post("/update-service-availability", blockServiceAvailability);
router.put(
  "/edit-service/:id",
  upload.fields([{ name: "images", maxCount: 6 }]),
  uploadToS3IfExists,
  editService
);
router.put("/write-service-review/:id", writeReviewForService);
router.get("/get-review-by-service-id/:id", getReviewByServiceId);
router.put("/approve-service/:id", approveServices);
router.put("/disapprove-service/:id", disApproveService);
router.delete("/delete-service/:id", deleteService);

module.exports = router;
