const mongoose = require("mongoose");

// A Mood Board "Object Palette" item — managed by the admin and consumed by the
// Website and User App mood boards. Adding/editing here reflects everywhere
// automatically (no code change needed on the clients).
const moodPaletteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, default: "" },
    image: { type: String, default: "" }, // S3 URL of the item image/icon
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("mood-palette", moodPaletteSchema);
