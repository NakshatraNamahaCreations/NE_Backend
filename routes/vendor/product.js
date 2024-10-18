const express = require("express");
const router = express.Router();
const {
  addProduct,
  getAllProduct,
  getAllRentalProduct,
  getAllSellProduct,
  getProduct,
  writeReview,
  getReview,
  filteroutVendorProduct,
  getVendorProduct,
  getParticularVendorProduct,
} = require("../../controllers/vendor/product");
const multer = require("multer");

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/documents");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

const path = require("path");

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/product_image/"); // Directory to save uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post(
  "/addproduct",
  upload.fields([
    { name: "images", maxCount: 6 },
    { name: "video", maxCount: 1 },
  ]),
  (req, res, next) => {
    console.log("Request Files:", req.files);
    console.log("Request Body:", req.body);
    next();
  },
  addProduct
);
router.get("/getallproduct", getAllProduct);
router.get("/getrentalproduct", getAllRentalProduct);
router.get("/getproduct/:id", getProduct);
router.get("/getfilteroutproducts/:id", filteroutVendorProduct);
router.get("/get-particular-vendor-products/:id", getParticularVendorProduct);
router.get("/getsellproduct", getAllSellProduct);
router.get("/getvendorproduct/:id", getVendorProduct);
router.put("/review/:id", writeReview);
router.get("/getreview/:id", getReview);

module.exports = router;
