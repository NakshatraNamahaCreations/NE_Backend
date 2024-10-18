const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  member_name: String,
  mobile_number: String,
  password: String,
  dashboard: Boolean,
  // banner: Boolean,
  booking_management: Boolean,
  user_management: Boolean,
  vendor_management: Boolean,
  team_management: Boolean,
  isBlocked: {
    type: Boolean,
    default: false,
  },
});
const team = mongoose.model("team", teamSchema);

module.exports = team;
