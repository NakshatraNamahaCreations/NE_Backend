const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// Define Address Schema
const addressSchema = new mongoose.Schema(
  {
    fullName: String,
    mobileNumber: String,
    houseFlatBlock: String,
    roadArea: String,
    cityDownVillage: String,
    distric: String,
    state: String,
    pincode: String,
    directions: String,
  },
  { _id: true }
);

const requirementFieldSchema = new mongoose.Schema({
  field_type: { type: String, required: true },
  parameter: { type: String, required: true },
  // value: { type: mongoose.Schema.Types.Mixed }, // Adjust based on the type of data you expect
});

// Define User Schema
const vendorSchema = new mongoose.Schema({
  vendor_name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    lowercase: true,
    trim: true,
  },
  mobile_number: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  profession: {
    type: String,
  },
  profession_category: String,
  shop_name: String,
  godown_name: String,
  godown_pin: String,
  shop_image_or_logo: String,
  gst_number: String,
  pan_number: String,
  vehicle_name: String,
  number_plate: String,
  vehicle_image: String,
  vehicle_by: String,
  is_approved: Boolean,
  // requirement_fields: Array,
  pricing: Number,
  experience_in_business: String,
  year_of_establishment: String,
  website_url: String,
  business_hours: [
    {
      day: String,
      start_time: String,
      end_time: String,
    },
  ],
  additional_services: Array,
  additional_images: [String],
  address: [addressSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// // Pre-save hook to hash password before saving
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// // Method to compare password
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // Method to generate JWT token
// userSchema.methods.generateAuthToken = function () {
//   const accessToken = jwt.sign(
//     { id: this._id, role: this.role },
//     process.env.JWT_SECRET,
//     {
//       expiresIn: "1h", // Access token expires in 1 hour
//     }
//   );
//   const refreshToken = jwt.sign(
//     { id: this._id },
//     process.env.REFRESH_TOKEN_SECRET,
//     {
//       expiresIn: "7d", // Refresh token expires in 7 days
//     }
//   );
//   return { accessToken, refreshToken };
// };

// Compile model from schema
const User = mongoose.model("Vendor", vendorSchema);

module.exports = User;
