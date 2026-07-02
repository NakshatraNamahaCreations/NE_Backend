const express = require("express");
const router = express.Router();
const {
  addAddOns,
  getAllAddons,
  getAddOnsByVendorId,
  deleteAddOns,
} = require("../../controllers/vendor/addons");

router.post("/add-addons", addAddOns);
router.get("/get-all-addons", getAllAddons);
router.get("/get-addons-by-vendorid", getAddOnsByVendorId);
router.delete("/delete-addons/:id", deleteAddOns);

module.exports = router;
