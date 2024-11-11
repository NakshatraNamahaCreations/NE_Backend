const mongoose = require("mongoose");

const banner = new mongoose.Schema({
  banner_image: String,
});
const banners = mongoose.model("banner", banner);

module.exports = banners;
