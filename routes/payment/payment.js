const express = require("express");
const router = express.Router();
const {
  initiatePayment,
  checkTransactionStatus,
  // getpaymentstatusByUserId,
  // getAllPayment,
  // getPaymentByTransactionId,
} = require("../../controllers/payment/payment");

router.post("/initiate-payment", initiatePayment);

router.post(
  "/status/:merchantId/:merchantTransactionId/:userId",
  checkTransactionStatus
);
// router.get("/paymentstatus/:userId", getpaymentstatusByUserId);
// router.get("/getpayments", getAllPayment);

module.exports = router;
