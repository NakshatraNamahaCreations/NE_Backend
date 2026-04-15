const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema(
  {
    state_name: String,
    state_code: String,
    isStateActive: Boolean,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("state", stateSchema);
