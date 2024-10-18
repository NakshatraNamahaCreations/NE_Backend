const express = require("express");
const router = express.Router();
const {
  addSubService,
  // addSubServicesViaExcel,
  // getSubserviceByService,
  getAllSubService,
  deleteSubService,
} = require("../../controllers/service/sub-service");

router.post("/add-sub-service", addSubService);
// router.post("/add-service-via-excel", addServicesViaExcel);
// router.get("/get-all-service", getAllService);
router.get("/get-all-sub-service", getAllSubService);
router.delete("/delete-sub-service/:id", deleteSubService);

module.exports = router;
