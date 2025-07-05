const mongoose = require("mongoose");

const TermsConditionSchema = new mongoose.Schema({
  title: String,
  description: String,
  selected_type: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TermsCondition", TermsConditionSchema);
