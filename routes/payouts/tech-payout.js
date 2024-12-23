const express = require("express");
const router = express.Router();
const {
  addTechPayout,
  getAllPayouts,
  getPayoutsByIds,
  confirmPayoutProcessed,
} = require("../../controllers/payouts/tech-payout");

router.post("/add-tech-payout", addTechPayout);
router.get("/get-all-tech-payouts", getAllPayouts);
router.put("/confirm-tech-payout-processed/:id", confirmPayoutProcessed);
router.get("/get-tech-payouts-by-id/:id", getPayoutsByIds);
// router.put("/change-status/:id", changeTicketStatus);

module.exports = router;
