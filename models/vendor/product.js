const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    shop_name: String,
    vendor_id: String,
    vendor_name: String,
    product_name: String,
    product_image: [String],
    product_video: String,
    product_category: String,
    product_price: Number,
    approval_status: Boolean,
    mrp_rate: Number,
    discount: Number,
    brand: String,
    stock_in_hand: Number,
    model_name: String,
    material_type: String,
    product_dimension: String,
    product_weight: String,
    country_of_orgin: String,
    warranty: String,
    manufacturer_name: String,
    product_color: String,
    product_type: String,
    retuning_date: Number,
    Specifications: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    Reviews: [
      {
        user_id: String,
        user_name: String,
        review_title: String,
        review_description: String,
        ratings: Number,
        review_on: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const product = mongoose.model("Product", productSchema);

module.exports = product;
