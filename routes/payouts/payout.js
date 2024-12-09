const express = require("express");
const router = express.Router();
const {
  addPayout,
  getAllPayouts,
  getPayoutsByIds,
  confirmPayoutProcessed,
} = require("../../controllers/payouts/payout");

router.post("/add-payout", addPayout);
router.get("/get-all-payouts", getAllPayouts);
router.put("/confirm-payout-processed/:id", confirmPayoutProcessed);
router.get("/get-payouts-by-id/:id", getPayoutsByIds);
// router.put("/change-status/:id", changeTicketStatus);

module.exports = router;
