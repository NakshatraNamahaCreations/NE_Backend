const mongoose = require("mongoose");

const youtubeVideoSchema = new mongoose.Schema(
  {
    video_link: String,
    isVideoActive: Boolean,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("youtube", youtubeVideoSchema);
