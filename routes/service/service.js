const express = require("express");
const router = express.Router();
const {
  addService,
  addServicesViaExcel,
  getServiceByServiceName,
  getAllService,
  deleteService,
  addRequirements,
  updateStatus,
  getActiveService,
  deleteRequirementField,
} = require("../../controllers/service/service");
const multer = require("multer");
const { S3Client } = require("@aws-sdk/client-s3");
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
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `services/${Date.now()}-${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const uploader = new Upload({ client: s3, params: uploadParams });
    const uploadResult = await uploader.done();

    req.body.service_image = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    next();
  } catch (error) {
    console.log("Upload image error:", error);
    res
      .status(500)
      .json({ error: "Image upload failed", details: error.message });
  }
};

router.post(
  "/add-service",
  upload.single("service_image"),
  uploadToS3,
  addService
);
router.put("/add-requirements/:id", addRequirements);
router.get("/get-service-by-servicename/:name", getServiceByServiceName);
router.post("/add-service-via-excel", addServicesViaExcel);
router.get("/get-all-service", getAllService);
router.get("/get-active-service", getActiveService);
router.delete("/delete-service/:id", deleteService);
router.put("/update-status/:id", updateStatus);
router.put("/services/:unique_id/delete-field", deleteRequirementField);

module.exports = router;
