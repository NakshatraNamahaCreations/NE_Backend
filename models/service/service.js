const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  service_name: String,
  service_image: String,
  isActive: Boolean,
  requirement_fields: Array,
});
const serivces = mongoose.model("service", serviceSchema);

module.exports = serivces;
