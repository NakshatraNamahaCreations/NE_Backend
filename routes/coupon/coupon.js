const express = require("express");
const router = express.Router();
const {
  createCoupon,
  getAllCoupons,
  getActiveCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  redeemCoupon,
} = require("../../controllers/coupon/coupon");

// Admin
router.post("/create", createCoupon);
router.get("/get-all", getAllCoupons);
router.put("/update/:id", updateCoupon);
router.delete("/delete/:id", deleteCoupon);

// User
router.get("/get-active", getActiveCoupons);
router.post("/validate", validateCoupon);
router.post("/redeem", redeemCoupon);

module.exports = router;
