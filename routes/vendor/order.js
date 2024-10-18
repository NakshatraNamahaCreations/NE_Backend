const express = require("express");
const router = express.Router();
const {
  vendorOrder,
  getVendorOrder,
  returnOrder,
} = require("../../controllers/vendor/order");

router.post("/create-order", vendorOrder);
router.get("/get-vendor-order/:id", getVendorOrder);
router.put("/return-order/:id", returnOrder);

module.exports = router;
