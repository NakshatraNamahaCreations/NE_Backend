const mongoose = require("mongoose");

const TermsConditionSchema = new mongoose.Schema({
  termsContent: {
    type: String,
  },
  type: {
    type: String,
    default: "terms",
    unique: true,
  },
  userType: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TermsCondition", TermsConditionSchema);
