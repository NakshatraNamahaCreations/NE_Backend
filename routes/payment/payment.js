const express = require("express");
const router = express.Router();
const {
  initiatePayment,
  checkTransactionStatus,
} = require("../../controllers/payment/payment");

const {
  newPayment,
  checkStatus,
} = require("../../controllers/payment/webPayment");

router.post("/initiate-payment", initiatePayment);

router.get(
  "/status/:merchantId/:merchantTransactionId/:userId",
  checkTransactionStatus
);

router.post("/web-initiate", newPayment);

// PhonePe redirect calls this
router.post("/web-status/:txn", checkStatus);

module.exports = router;
