const couponSchema = require("../../models/coupon/coupon");

// ---------- Admin CRUD ----------

exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_value,
      max_discount,
      valid_from,
      valid_to,
      usage_limit,
      per_user_limit,
      isActive,
    } = req.body;

    if (!code || discount_value == null) {
      return res
        .status(400)
        .json({ message: "Coupon code and discount value are required" });
    }

    const existing = await couponSchema.findOne({
      code: code.toUpperCase().trim(),
    });
    if (existing) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = new couponSchema({
      code,
      description,
      discount_type,
      discount_value,
      min_order_value,
      max_discount,
      valid_from,
      valid_to,
      usage_limit,
      per_user_limit,
      isActive,
    });
    await coupon.save();
    return res.status(201).json({ message: "Coupon created", coupon });
  } catch (error) {
    console.error("createCoupon error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await couponSchema.find().sort({ _id: -1 });
    return res.status(200).json({ coupons });
  } catch (error) {
    console.error("getAllCoupons error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Active + currently-valid coupons, for showing available offers to users.
exports.getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await couponSchema
      .find({
        isActive: true,
        $and: [
          { $or: [{ valid_from: null }, { valid_from: { $lte: now } }] },
          { $or: [{ valid_to: null }, { valid_to: { $gte: now } }] },
        ],
      })
      .sort({ _id: -1 });
    return res.status(200).json({ coupons });
  } catch (error) {
    console.error("getActiveCoupons error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await couponSchema.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    return res.status(200).json({ message: "Coupon updated", coupon });
  } catch (error) {
    console.error("updateCoupon error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const deleted = await couponSchema.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Coupon not found" });
    return res.status(200).json({ message: "Coupon deleted" });
  } catch (error) {
    console.error("deleteCoupon error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------- User: validate & redeem ----------

// Compute the discount for a given coupon + cart value.
const computeDiscount = (coupon, cartValue) => {
  let discount = 0;
  if (coupon.discount_type === "percentage") {
    discount = (cartValue * coupon.discount_value) / 100;
    if (coupon.max_discount != null && discount > coupon.max_discount) {
      discount = coupon.max_discount;
    }
  } else {
    discount = coupon.discount_value;
  }
  // Never discount more than the cart itself.
  if (discount > cartValue) discount = cartValue;
  return Math.round(discount * 100) / 100;
};

// Validate a coupon against the cart (no side effects). Returns the discount.
exports.validateCoupon = async (req, res) => {
  try {
    const { code, cart_value, user_id } = req.body;
    const cartValue = Number(cart_value) || 0;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await couponSchema.findOne({
      code: code.toUpperCase().trim(),
    });
    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }
    if (!coupon.isActive) {
      return res.status(400).json({ message: "This coupon is not active" });
    }

    const now = new Date();
    if (coupon.valid_from && now < coupon.valid_from) {
      return res.status(400).json({ message: "This coupon is not active yet" });
    }
    if (coupon.valid_to && now > coupon.valid_to) {
      return res.status(400).json({ message: "This coupon has expired" });
    }

    if (cartValue < (coupon.min_order_value || 0)) {
      return res.status(400).json({
        message: `Minimum order of ₹${coupon.min_order_value} required to use this coupon`,
      });
    }

    if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit) {
      return res
        .status(400)
        .json({ message: "This coupon has reached its usage limit" });
    }

    if (coupon.per_user_limit != null && user_id) {
      const usage = coupon.used_by.find((u) => u.user_id === user_id);
      if (usage && usage.count >= coupon.per_user_limit) {
        return res
          .status(400)
          .json({ message: "You have already used this coupon" });
      }
    }

    const discount = computeDiscount(coupon, cartValue);
    return res.status(200).json({
      message: "Coupon applied successfully",
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount,
      final_amount: Math.round((cartValue - discount) * 100) / 100,
    });
  } catch (error) {
    console.error("validateCoupon error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark a coupon as used — call after a successful order/payment.
exports.redeemCoupon = async (req, res) => {
  try {
    const { code, user_id } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }
    const coupon = await couponSchema.findOne({
      code: code.toUpperCase().trim(),
    });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    coupon.used_count += 1;
    if (user_id) {
      const usage = coupon.used_by.find((u) => u.user_id === user_id);
      if (usage) usage.count += 1;
      else coupon.used_by.push({ user_id, count: 1 });
    }
    await coupon.save();
    return res.status(200).json({ message: "Coupon redeemed" });
  } catch (error) {
    console.error("redeemCoupon error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
