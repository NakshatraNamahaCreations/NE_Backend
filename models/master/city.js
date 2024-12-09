const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    state_name: String,
    state_id: String,
    city_code: String,
    city_name: String,
    isCityActive: Boolean,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("city", citySchema);
