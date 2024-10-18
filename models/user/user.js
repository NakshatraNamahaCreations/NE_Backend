const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// Define User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    // required: true,
    minlength: 3,
    maxlength: 50,
    // trim: true,
  },
  email: {
    type: String,
    // required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    lowercase: true,
    // trim: true,
  },
  mobilenumber: {
    type: Number,
    required: true,
    // unique: true,
  },
  password: {
    type: String,
    // required: true,
    minlength: 6,
  },
  saved_address: Array,
  company_profile: [
    {
      company_type: String,
      company_name: String,
      designation: String,
      // name: String,
      // mca_panel_member_name: String,
      gst_number: String,
      pan_number: String,
      trade_license: String,
      cin_number: String,
      // moa_number: String,
    },
  ],
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
const User = mongoose.model("User", userSchema);

module.exports = User;
