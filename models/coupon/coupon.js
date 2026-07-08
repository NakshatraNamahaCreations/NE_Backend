const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: String,
    // "percentage" -> discount_value is a % ; "flat" -> discount_value is ₹
    discount_type: {
      type: String,
      enum: ["percentage", "flat"],
      default: "percentage",
    },
    discount_value: { type: Number, required: true },
    // Minimum cart total required to use the coupon.
    min_order_value: { type: Number, default: 0 },
    // Upper cap on the discount for percentage coupons (null = no cap).
    max_discount: { type: Number, default: null },
    valid_from: { type: Date, default: null },
    valid_to: { type: Date, default: null },
    // Total redemptions allowed across all users (null = unlimited).
    usage_limit: { type: Number, default: null },
    used_count: { type: Number, default: 0 },
    // How many times a single user may use it (null = unlimited).
    per_user_limit: { type: Number, default: null },
    // Per-user redemption tracking.
    used_by: [
      {
        user_id: String,
        count: { type: Number, default: 0 },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("coupon", couponSchema);
