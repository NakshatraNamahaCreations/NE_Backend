const mongoose = require("mongoose");

const userOrderSchema = new mongoose.Schema(
  {
    order_id: String,
    // product_id: String,
    // product_image: String,
    event_date: String,
    event_name: String,
    number_of_days: Number,
    // event_address: String,
    google_maplink: String,
    upload_invitation: String,
    upload_gatepass: String,
    receiver_name: String,
    receiver_mobilenumber: String,
    // product_price: Number,
    // applied_quantity: Number,
    // totalPrice: Number,
    product_data: Array,
    service_data: Array,
    // product_mrp: Number,
    // product_name: String,
    user_id: String,
    user_name: String,
    venue_name: String,
    venue_open_time: String,
    event_location: String,
    event_start_time: String,
    // cart_value: Number,
    sub_total: Number,
    cart_total: Number,
    gst_applied_value: Number,
    paid_amount: Number,
    payment_method: String,
    order_status: String,
    payment_status: String,
    stock_in_hand: Number,
    ordered_date: { type: Date },
    returned_date: { type: Date },
    delivered_date: { type: Date },
  },
  {
    timestamps: true,
  }
);

const UserOrder = mongoose.model("UserOrder", userOrderSchema);

module.exports = UserOrder;
