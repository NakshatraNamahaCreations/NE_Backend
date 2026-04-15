const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema(
  {
    seller_name: String,
    store: String,
    seller_id: String,
    ordered_date: String,
    event_name: String,
    event_id: String,
    payout_status: String,
    created_date: String,
    updated_by: String,
    commission_percentage: Number,
    commission_amount: Number,
    tax_percentage: Number,
    tax_amount: Number,
    payout_amount: Number,
    remark: String,
    processed_date: String,
    transaction_Id: String,
    failure_remark: String,
  },
  {
    timestamps: true,
  }
);

const payout = mongoose.model("payout", payoutSchema);

module.exports = payout;
