const mongoose = require("mongoose");

const companyAddressSchema = new mongoose.Schema(
  {
    state_name: String,
    state_id: String,
    city_id: String,
    city_name: String,
    address: String,
    contact_phone: String,
    contact_email: String,
    isAddressActive: Boolean,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("companyaddress", companyAddressSchema);
