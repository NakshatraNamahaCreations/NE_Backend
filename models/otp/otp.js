const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  mobilenumber: { type: String, required: true },
  otp: { type: Number, required: true },
  expiry: { type: Date, required: true },
});

otpSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model("Otp", otpSchema);
