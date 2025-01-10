const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  member_name: String,
  mobile_number: String,
  email_id: String,
  password: String,
  profile: Boolean,
  dashboard_management: Boolean,
  team_management: Boolean,
  banner_management: Boolean,
  service_management: Boolean,
  billing_address: Boolean,
  state: Boolean,
  city: Boolean,
  subservice_management: Boolean,
  requirement_management: Boolean,
  userbooking_management: Boolean,
  vendororder_management: Boolean,
  manage_user: Boolean,
  manage_vendor: Boolean,
  manage_teammemebrs: Boolean,
  manage_sellproducts: Boolean,
  manage_rentalproducts: Boolean,
  event_report: Boolean,
  calculate: Boolean,
  cancel_event: Boolean,
  reschedule_event: Boolean,
  ticket_raised: Boolean,
  pyout_config: Boolean,
  product_payout: Boolean,
  service_payout: Boolean,
  tech_payout: Boolean,
  faq: Boolean,
  tnc: Boolean,
  youtube_video: Boolean,
  isBlocked: {
    type: Boolean,
    default: false,
  },
});
const team = mongoose.model("team", teamSchema);

module.exports = team;
