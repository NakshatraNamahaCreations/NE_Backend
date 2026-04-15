const express = require("express");
const router = express.Router();
const {
  addSubService,
  // addSubServicesViaExcel,
  // getSubserviceByService,
  getAllSubService,
  deleteSubService,
  updateStatus,
  getActiveSubService,
} = require("../../controllers/service/sub-service");

router.post("/add-sub-service", addSubService);
// router.post("/add-service-via-excel", addServicesViaExcel);
router.get("/get-active-sub-service", getActiveSubService);
router.get("/get-all-sub-service", getAllSubService);
router.delete("/delete-sub-service/:id", deleteSubService);
router.put("/update-sub-service-status/:id", updateStatus);

module.exports = router;
