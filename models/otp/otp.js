const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  mobilenumber: { type: String },
  otp: { type: Number, required: true },
  expiry: { type: Date, required: true },
  email: String,
});

otpSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model("Otp", otpSchema);
