const mongoose = require("mongoose");

const Technician = new mongoose.Schema({
  banner_image: String,
  price: Number,
  category: String,
  service_name: String,
  vendor_id: String,
  vendor_name: String,
  shop_name: String,
});
const Technicians = mongoose.model("Technician", Technician);

module.exports = Technicians;
