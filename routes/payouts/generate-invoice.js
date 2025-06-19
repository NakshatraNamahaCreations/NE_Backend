const express = require("express");
const router = express.Router();
const {
  generateInvoice,
  getAllInvoice,
  getStatusById,
} = require("../../controllers/payouts/generate-invoice");

router.post("/create-invoice", generateInvoice);
router.get("/get-all-invoice", getAllInvoice);
router.get("/get-invoice-status-invoice-by-id", getStatusById);

module.exports = router;
