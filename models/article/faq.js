const mongoose = require("mongoose");

const faq = new mongoose.Schema({
  selected_type: String,
  question: String,
  answer: String,
  isActive: Boolean,
});
const faqs = mongoose.model("faq", faq);

module.exports = faqs;
