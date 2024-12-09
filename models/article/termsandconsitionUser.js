const mongoose = require("mongoose");

const TermsConditionUserSchema = new mongoose.Schema({
  termsContent: {
    type: String,
  },
  type: {
    type: String,
    default: "terms",
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TermsConditionUser", TermsConditionUserSchema);
