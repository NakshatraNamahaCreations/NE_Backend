const express = require("express");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const router = express.Router();

const {
  addProduct,
  getAllProduct,
  getAllRentalProduct,
  getFeaturedProducts,
  getAllSellProduct,
  getProduct,
  writeReview,
  getReview,
  filteroutVendorProduct,
  getVendorProduct,
  getParticularVendorProduct,
  approveProduct,
  disApproveProduct,
  getAllSellForAdminProduct,
  getRentalProductForAdmin,
  deleteProduct,
  productStatusChange,
  addProductsViaExcel,
  addProductImage,
  editProduct,
} = require("../../controllers/vendor/product");

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
    if (!req.files || (!req.files.images && !req.files.video)) {
      throw new Error("No files provided");
    }

    // console.log("req.files:", req.files);

    const uploadedFiles = {};
    for (const [key, files] of Object.entries(req.files)) {
      uploadedFiles[key] = await Promise.all(
        files.map(async (file) => {
          const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `product_files/${Date.now()}-${file.originalname}`,
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
    req.body.product_image = uploadedFiles.images || [];
    req.body.product_video = uploadedFiles.video
      ? uploadedFiles.video[0]
      : null;

    next();
  } catch (error) {
    // console.error("Upload error:", error);
    res
      .status(500)
      .json({ error: "File upload failed", details: error.message });
  }
};

router.post(
  "/addproduct",
  upload.fields([
    { name: "images", maxCount: 6 },
    { name: "video", maxCount: 1 },
  ]),
  uploadToS3,
  // (req, res, next) => {
  //   console.log("Request Files:", req.files);
  //   console.log("Request Body:", req.body);
  //   next();
  // },
  addProduct
);
router.get("/getallproduct", getAllProduct);
router.get("/getrentalproduct", getAllRentalProduct);
router.get("/getfeaturedproducts", getFeaturedProducts);
router.get("/getproduct/:id", getProduct);
router.get("/getfilteroutproducts/:id", filteroutVendorProduct);
router.get("/get-particular-vendor-products/:id", getParticularVendorProduct);
router.get("/getsellproduct", getAllSellProduct);
router.get("/getvendorproduct/:id", getVendorProduct);
router.put("/review/:id", writeReview);
router.get("/getreview/:id", getReview);
router.put("/product-Status/:id", productStatusChange);
router.get("/get-rental-product-for-admin", getRentalProductForAdmin);
router.get("/get-all-sell-product-for-admin", getAllSellForAdminProduct);

router.put("/product-approved/:id", approveProduct);
router.put("/product-disapproved/:id", disApproveProduct);
router.delete("/delete-product/:id", deleteProduct);
router.post("/add-products-via-excel", addProductsViaExcel);

router.put(
  "/edit-product/:id",
  upload.fields([
    { name: "images", maxCount: 6 },
    { name: "video", maxCount: 1 },
  ]),
  uploadToS3,
  editProduct
);

// admin
router.put(
  "/add-product-image/:id",
  upload.fields([{ name: "images", maxCount: 6 }]),
  uploadToS3,
  addProductImage
);

module.exports = router;
