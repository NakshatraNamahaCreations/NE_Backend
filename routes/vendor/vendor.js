const express = require("express");
const { refreshToken } = require("../../controllers/authController");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const router = express.Router();
const {
  vendorRegister,
  addVendorBusinessDetails,
  vendorLoginWithGmail,
  getVendorProfile,
  // updateVendorProfile,
  deleteVendorProfile,
  addAddress,
  getAllVendor,
  loginWithMobile,
  loginWithGoogle,
  getAllFilteroutVendor,
  // addServiceRequiredFields,
  // addServiceAdditionalDetails,
  getOnlyProductVendor,
  getOnlyServiceVendor,
  getVendorByServiceName,
  addServiceUserBusinessDetails,
  addAdditionalServices,
  writeReview,
  getServiceReview,
  vendorDisapprove,
  vendorApprove,
  vendorStatus,
  getAllVendorsForAdmin,
  addCommissions,
  deleteVendor,
  forgotPassword,
  verifyOTP,
  resetPassword,
  resendEmailOTP,
} = require("../../controllers/vendor/vendorController");
const multer = require("multer");
const path = require("path");
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/vendor_profile/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage: storage });
// const additionalStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/additional_images/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const uploadAdditional = multer({ storage: additionalStorage });

// ,....................

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
            Key: `vendor_profile/${Date.now()}-${file.originalname}`,
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

    req.body.shop_image_or_logo = uploadedFiles.shop_image_or_logo
      ? uploadedFiles.shop_image_or_logo[0]
      : null;
    req.body.vehicle_image = uploadedFiles.vehicle_image
      ? uploadedFiles.vehicle_image[0]
      : null;

    req.body.aadhaar_front = uploadedFiles.aadhaar_front
      ? uploadedFiles.aadhaar_front[0]
      : null;

    req.body.aadhaar_back = uploadedFiles.aadhaar_back
      ? uploadedFiles.aadhaar_back[0]
      : null;
    next();
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({ error: "File upload failed", details: error.message });
  }
};

// Additonal image
const uploadToS3ForAdditionalImages = async (req, res, next) => {
  try {
    console.log("req.files:", req.files);

    if (!req.files || !req.files.additional_images) {
      throw new Error("No files provided");
    }

    const uploadedFiles = await Promise.all(
      req.files.additional_images.map(async (file) => {
        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `additional_images/${Date.now()}-${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const uploader = new Upload({
          client: s3,
          params: uploadParams,
        });

        const uploadResult = await uploader.done();
        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
        console.log("Uploaded File URL:", fileUrl); // Debug the uploaded file URL
        return fileUrl;
      })
    );

    console.log("Uploaded Files Array:", uploadedFiles);
    req.body.additional_images = uploadedFiles; // Attach the array of URLs to req.body

    next();
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({ error: "File upload failed", details: error.message });
  }
};

router.post("/refresh-token", refreshToken);
router.post("/register", vendorRegister);
router.put(
  "/add-vendor-business-details/:id",
  upload.fields([
    { name: "shop_image_or_logo", maxCount: 1 },
    { name: "aadhaar_front", maxCount: 1 },
    { name: "aadhaar_back", maxCount: 1 },
    { name: "vehicle_image", maxCount: 1 }, //vendor profile
  ]),
  uploadToS3,
  addVendorBusinessDetails
);

router.post("/login-with-gmail", vendorLoginWithGmail);
router.put(
  "/add-service-user-business-details/:id",
  upload.fields([
    { name: "shop_image_or_logo", maxCount: 1 },
    { name: "aadhaar_front", maxCount: 1 },
    { name: "aadhaar_back", maxCount: 1 },
  ]), //vendor profile
  uploadToS3,
  addServiceUserBusinessDetails
);

router.post("/loginwithmobilenumber", loginWithMobile);
router.post("/login-with-google-account", loginWithGoogle);
router.get("/getprofile/:id", getVendorProfile);
router.get("/getallvendor", getAllVendor);
router.get("/get-product-vendor", getOnlyProductVendor);
router.get("/get-service-vendor", getOnlyServiceVendor);

router.get("/filterout-vendors/:id", getAllFilteroutVendor);
router.get("/get-vendor-by-servicename/:name", getVendorByServiceName);
router.delete("/delete-vendor-profile", deleteVendorProfile);
router.put("/add-address/:id", addAddress);
router.put(
  "/add-additional-services/:id",
  upload.fields([{ name: "additional_images", maxCount: 6 }]),
  uploadToS3ForAdditionalImages,
  addAdditionalServices //additional_images
);
router.put("/write-review/:id", writeReview);
router.get("/get-service-review/:id", getServiceReview);
router.put("/vendor-approve/:id", vendorApprove);
router.put("/vendor-Status/:id", vendorStatus);
router.put("/vendor-disapprove/:id", vendorDisapprove);
router.get("/get-all-vendors-for-admin", getAllVendorsForAdmin);
router.put("/add-commissions/:id", addCommissions);
router.delete("/delete-vendor/:id", deleteVendor);
router.post("/forgot-password", forgotPassword);
router.post("/reset-vendor-password", resetPassword);
router.post("/resent-otp", resendEmailOTP);
router.post("/verify-email-otp", verifyOTP);

module.exports = router;
