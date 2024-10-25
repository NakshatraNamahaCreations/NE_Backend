const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  member_name: String,
  mobile_number: String,
  password: String,
  dashboard_management: Boolean,
  banner_management: Boolean,
  service_management: Boolean,
  subservice_management: Boolean,
  requirement_management: Boolean,
  userbooking_management: Boolean,
  vendororder_management: Boolean,
  manage_user: Boolean,
  manage_vendor: Boolean,
  manage_teammemebrs: Boolean,
  manage_sellproducts: Boolean,
  manage_rentalproducts: Boolean,
  isBlocked: {
    type: Boolean,
    default: false,
  },
});
const team = mongoose.model("team", teamSchema);

module.exports = team;
