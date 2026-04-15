const mongoose = require("mongoose");

const serviceEnquiry = new mongoose.Schema(
  {
    service_id: String,
    service_name: String,
    room_name: String,
    room_id: String,
    vendor_id: String,
    user_name: String,
    user_id: String,
    booking_date: String,
    adult_qty: String,
    children_qty: String,
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("service-enquiry", serviceEnquiry);
