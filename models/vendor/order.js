const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    order_id: String,
    product_id: String,
    product_image: String,
    store_or_seller: String,
    product_price: Number,
    applied_quantity: Number,
    totalPrice: Number,
    product_mrp: Number,
    product_name: String,
    product_category: String,
    vendor_id: String,
    vendor_name: String,
    seller_name: String,
    seller_id: String,
    // product: Array,
    delivery_address: Object,
    cart_value: Number,
    gst_applied_value: Number,
    paid_amount: Number,
    payment_method: String,
    order_status: String,
    payment_status: String,
    reason_command: String,
    return_reason: String,
    ordered_date: Date,
    returned_date: Date,
    // cancelled_date: { type: Date },
    delivered_date: { type: Date },
  },
  {
    timestamps: true,
  }
);

const order = mongoose.model("vendororder", orderSchema);

module.exports = order;
