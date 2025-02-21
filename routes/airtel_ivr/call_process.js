const express = require("express");
const router = express.Router();
const {
  initiateCallUserToVendor,
} = require("../../controllers/airtel_ivr/call_process");

router.post("/initiate-call-from-user-to-vendor", initiateCallUserToVendor);
module.exports = router;
