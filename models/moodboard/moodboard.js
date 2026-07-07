const mongoose = require("mongoose");

// A saved Mood Board layout. `items` holds the placed objects/images exactly as
// the client sends them (position, image, rotation, etc.) so the same document
// works for both the website and the user app.
const moodboardSchema = new mongoose.Schema(
  {
    user_id: String,
    project_name: String,
    items: {
      type: Array,
      default: [],
    },
    preview_image: String,
  },
  {
    timestamps: true,
  }
);

const moodboard = mongoose.model("moodboard", moodboardSchema);

module.exports = moodboard;
