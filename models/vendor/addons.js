const mongoose = require("mongoose");

const addOnsSchema = new mongoose.Schema({
  banner_image: String,
  price: Number,
  category: String,
  service_name: String,
  vendor_id: String,
  vendor_name: String,
  shop_name: String,
});
const addOns = mongoose.model("addOns", addOnsSchema);

module.exports = addOns;
