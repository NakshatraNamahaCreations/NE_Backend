const express = require("express");
const router = express.Router();
const {
  addAddress,
  getAllAddress,
  getActiveAddress,
  getAddressById,
  deleteAddress,
  activeStatus,
  inActiveStatus,
} = require("../../controllers/master/address");

router.post("/add-address", addAddress);
router.get("/get-all-addresses", getAllAddress);
router.get("/get-address-by-id/:id", getAddressById);
router.get("/get-active-addresses", getActiveAddress);
router.delete("/delete-address/:id", deleteAddress);
router.put("/address-active-status/:id", activeStatus);
router.put("/address-inactive-status/:id", inActiveStatus);

module.exports = router;
