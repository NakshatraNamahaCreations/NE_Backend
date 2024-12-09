const mongoose = require("mongoose");

const company = new mongoose.Schema(
  {
    company_name: String,
    company_logo: String,
    corporate_address: String,
    contact_email: String,
    contact_phone: String,
    site_favicon: String,
    website_url: String,
    footer_text: String,
    social_media: [
      {
        social_media_name: String,
        social_media_url: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("companyprofile", company);
