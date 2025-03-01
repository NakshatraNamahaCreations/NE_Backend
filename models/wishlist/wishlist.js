const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user_id: String,
    product_id: String,
    product_name: String,
    product_image: String,
    product_price: Number,
    mrp_price: Number,
    discount: Number,
  },
  {
    timestamps: true,
  }
);
const wishlist = mongoose.model("wishlist", wishlistSchema);

module.exports = wishlist;
