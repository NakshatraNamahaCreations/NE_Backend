const mongoose = require("mongoose");

const subServiceSchema = new mongoose.Schema({
  service_name: String,
  service_id: String,
  sub_service_name: String,
});
const subSerivces = mongoose.model("subservice", subServiceSchema);

module.exports = subSerivces;
