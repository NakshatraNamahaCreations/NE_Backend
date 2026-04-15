const express = require("express");
const router = express.Router();
const {
  addTechnician,
  getAllTech,
  getTechByVendorId,
  deleteTechnician,
  editTechnician,
} = require("../../controllers/master/technician");
// const path = require("path");
// const multer = require("multer");
// const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
// const { Upload } = require("@aws-sdk/lib-storage");

// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// const storage = multer.memoryStorage();

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 },
// });

// const uploadToS3 = async (req, res, next) => {
//   try {
//     if (!req.files) {
//       throw new Error("No files provided");
//     }

//     // console.log("req.files:", req.files);

//     const uploadedFiles = {};
//     for (const [key, files] of Object.entries(req.files)) {
//       uploadedFiles[key] = await Promise.all(
//         files.map(async (file) => {
//           const uploadParams = {
//             Bucket: process.env.AWS_S3_BUCKET_NAME,
//             Key: `technician/${Date.now()}-${file.originalname}`,
//             Body: file.buffer,
//             ContentType: file.mimetype,
//           };

//           const uploader = new Upload({
//             client: s3,
//             params: uploadParams,
//           });

//           const uploadResult = await uploader.done();
//           return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
//         })
//       );
//     }
//     // console.log("Uploaded files:", uploadedFiles);

//     // Assign the uploaded URLs to req.body fields
//     req.body.banner_image = uploadedFiles.banner_image
//       ? uploadedFiles.banner_image[0] // Only one file expected
//       : null;

//     next();
//   } catch (error) {
//     console.error("Upload error:", error);
//     res
//       .status(500)
//       .json({ error: "File upload failed", details: error.message });
//   }
// };

router.post(
  "/add-technician",
  // upload.fields([{ name: "banner_image", maxCount: 1 }]),
  // uploadToS3,
  addTechnician
);
router.get("/get-all-technician", getAllTech);
router.get("/get-technician-by-vendor-id/:id", getTechByVendorId);

router.delete("/delete_technician/:id", deleteTechnician);
router.put("/edit-technician/:id", editTechnician);

module.exports = router;
