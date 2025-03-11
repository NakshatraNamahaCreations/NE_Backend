const {
  newPayment,
  checkStatus,
} = require("../../controllers/payment/payment");
const express = require("express");
const router = express.Router(); // Use Router() instead of express()

// Initiate payment
router.post("/payment", newPayment);

// Check payment status using the correct parameter name
router.post("/status/:transactionId", checkStatus);

module.exports = router;
