const express = require("express");
const router = express.Router();
const {
  addOrUpdatePayoutConfig,
  getPayoutConfig,
} = require("../../controllers/master/payout_config");

router.post("/add-or-update-config", addOrUpdatePayoutConfig);
router.get("/get-payout-config-profile", getPayoutConfig);

module.exports = router;
