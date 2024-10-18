const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  addService,
  addServicesViaExcel,
  getServiceByServiceName,
  getAllService,
  deleteService,
  addRequirements,
} = require("../../controllers/service/service");

const path = require("path");

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/service_image/"); // Directory to save uploaded files
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
  "/add-service",
  // upload.single("service_image"),
  addService
);
router.put("/add-requirements/:id", addRequirements);
router.get("/get-service-by-servicename/:name", getServiceByServiceName);
router.post("/add-service-via-excel", addServicesViaExcel);
router.get("/get-all-service", getAllService);
router.delete("/delete-service/:id", deleteService);

module.exports = router;
