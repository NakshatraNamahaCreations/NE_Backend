const mongoose = require("mongoose");

const vendorInApp = new mongoose.Schema(
  {
    vendor_id: String,
    product_id: String,
    user_id: String,
    notification_type: String,
    message: String,
    status: String,
    metadata: Object,
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("vendor-inapp", vendorInApp);

// product approval
// vendor id, product id,apprval message, read status,create at

// user order
// user id, vendor id, product id, order id,
