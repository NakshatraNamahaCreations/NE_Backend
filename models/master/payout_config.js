const mongoose = require("mongoose");

const payoutConfig = new mongoose.Schema(
  {
    company_gst: String,
    company_cin: String,
    company_pan: String,
    company_saccode: String,
    razorpay_percentage: Number,
    tds_percentage: Number,
    terms_and_conditions: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("payoutconfig", payoutConfig);
