const express = require("express");
const router = express.Router();
const {
  initiatePayment,
  checkTransactionStatus,
} = require("../../controllers/payment/payment");

router.post("/initiate-payment", initiatePayment);

router.get(
  "/status/:merchantId/:merchantTransactionId/:userId",
  checkTransactionStatus
);

module.exports = router;
