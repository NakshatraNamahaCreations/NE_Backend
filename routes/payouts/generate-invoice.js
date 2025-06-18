const express = require("express");
const router = express.Router();
const {
  generateInvoice,
  //   getAllPayouts,
} = require("../../controllers/payouts/generate-invoice");

router.post("/create-invoice", generateInvoice);
// router.get("/get-all-payouts", getAllPayouts);

module.exports = router;
