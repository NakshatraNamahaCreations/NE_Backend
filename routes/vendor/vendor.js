const express = require("express");
const { refreshToken } = require("../../controllers/authController");
const router = express.Router();
const {
  vendorRegister,
  addVendorBusinessDetails,
  vendorLogin,
  getVendorProfile,
  // updateVendorProfile,
  deleteVendorProfile,
  addAddress,
  getAllVendor,
  loginWithMobile,
  getAllFilteroutVendor,
  // addServiceRequiredFields,
  // addServiceAdditionalDetails,
  getOnlyProductVendor,
  getVendorByServiceName,
  addServiceUserBusinessDetails,
  addAdditionalServices,
} = require("../../controllers/vendor/vendorController");
// const authMiddleware = require("../../controllers/middleware/authMiddleware");
const multer = require("multer");

const path = require("path");

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/vendor_profile/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

const additionalStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/additional_images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadAdditional = multer({ storage: additionalStorage });

// Route for refreshing token
router.post("/refresh-token", refreshToken);
router.post("/register", vendorRegister);
router.put(
  "/add-vendor-business-details/:id",
  upload.fields([
    { name: "shop_image_or_logo", maxCount: 1 },
    { name: "vehicle_image", maxCount: 1 },
  ]),
  addVendorBusinessDetails
);

router.post("/login", vendorLogin);
router.put(
  "/add-service-user-business-details/:id",
  upload.fields([{ name: "shop_image_or_logo", maxCount: 1 }]),
  addServiceUserBusinessDetails
);
// router.post(
//   "/save-vendor-details/:id",
//   uploadAdditional.fields([{ name: "shop_image_or_logo", maxCount: 5 }]),
//   addServiceRequiredFields
// );
// router.put(
//   "/add-service-additional-details/:id",
//   upload1.fields([{ name: "images", maxCount: 5 }]),
//   addServiceAdditionalDetails
// );

router.post("/loginwithmobilenumber", loginWithMobile);
router.get("/getprofile/:id", getVendorProfile);
router.get("/getallvendor", getAllVendor);
router.get("/get-product-vendor", getOnlyProductVendor);
router.get("/filterout-vendors/:id", getAllFilteroutVendor);
router.get("/get-vendor-by-servicename/:name", getVendorByServiceName);
router.delete("/delete-vendor-profile", deleteVendorProfile);
router.put("/add-address/:id", addAddress);
router.put(
  "/add-additional-services/:id",
  uploadAdditional.fields([{ name: "additional_images", maxCount: 6 }]),
  addAdditionalServices
);

module.exports = router;
