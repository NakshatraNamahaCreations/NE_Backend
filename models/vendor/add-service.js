const mongoose = require("mongoose");

const addServices = new mongoose.Schema(
  {
    shop_name: String,
    vendor_id: String,
    vendor_name: String,
    price: Number,
    service_description: String,
    service_category: String,
    service_name: String,
    service_subcategory: String,
    isFeatured: Boolean,
    available_start_date: String,
    available_end_date: String,
    additional_images: [String],
    approval_status: String,
    reason_for_disapprove: String,
    isActive: Boolean,
    additional_services: [
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

const service = mongoose.model("addservice", addServices);

module.exports = service;
