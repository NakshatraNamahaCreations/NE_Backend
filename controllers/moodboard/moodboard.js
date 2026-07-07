const moodboardSchema = require("../../models/moodboard/moodboard");

// Save a new Mood Board layout to the database.
exports.saveMoodboard = async (req, res) => {
  try {
    const { user_id, project_name, items, preview_image } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Mood board is empty. Add items before saving." });
    }

    const moodboard = new moodboardSchema({
      user_id,
      project_name: project_name || "Untitled",
      items,
      preview_image,
    });
    await moodboard.save();

    return res
      .status(200)
      .json({ message: "Mood board saved successfully", moodboard });
  } catch (error) {
    console.error("saveMoodboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all Mood Boards for a user (most recent first).
exports.getMyMoodboards = async (req, res) => {
  try {
    const moodboards = await moodboardSchema
      .find({ user_id: req.params.userId })
      .sort({ _id: -1 });
    return res.status(200).json({ moodboards });
  } catch (error) {
    console.error("getMyMoodboards error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a Mood Board.
exports.deleteMoodboard = async (req, res) => {
  try {
    const deleted = await moodboardSchema.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Mood board not found" });
    }
    return res.status(200).json({ message: "Mood board deleted" });
  } catch (error) {
    console.error("deleteMoodboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
