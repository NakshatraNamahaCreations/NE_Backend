const moodPaletteSchema = require("../../models/moodpalette/moodpalette");

// Admin: create a palette item. The image (if any) is uploaded to S3 by the
// route middleware and placed on req.body.image.
exports.createPaletteItem = async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    const item = await moodPaletteSchema.create({
      name: name.trim(),
      category: category?.trim() || "",
      image: req.body.image || "",
      isActive: true,
    });
    return res
      .status(201)
      .json({ message: "Palette item created", item });
  } catch (error) {
    console.error("createPaletteItem error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: full list (active + inactive).
exports.getAllPaletteItems = async (req, res) => {
  try {
    const items = await moodPaletteSchema.find().sort({ _id: -1 });
    return res.status(200).json({ items });
  } catch (error) {
    console.error("getAllPaletteItems error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Public (Website + User App): only active items.
exports.getActivePaletteItems = async (req, res) => {
  try {
    const items = await moodPaletteSchema
      .find({ isActive: true })
      .sort({ _id: -1 });
    return res.status(200).json({ items });
  } catch (error) {
    console.error("getActivePaletteItems error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: update. Only overwrite the image when a new one was uploaded so an
// edit that doesn't re-pick a file keeps the existing image.
exports.updatePaletteItem = async (req, res) => {
  try {
    const update = {};
    if (typeof req.body.name === "string") update.name = req.body.name.trim();
    if (typeof req.body.category === "string")
      update.category = req.body.category.trim();
    if (typeof req.body.isActive !== "undefined")
      update.isActive = req.body.isActive === "true" || req.body.isActive === true;
    if (req.body.image) update.image = req.body.image;

    const item = await moodPaletteSchema.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Item not found" });
    return res.status(200).json({ message: "Palette item updated", item });
  } catch (error) {
    console.error("updatePaletteItem error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: toggle enable/disable.
exports.togglePaletteItem = async (req, res) => {
  try {
    const item = await moodPaletteSchema.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    item.isActive =
      typeof req.body.isActive === "boolean"
        ? req.body.isActive
        : !item.isActive;
    await item.save();
    return res.status(200).json({ message: "Palette item updated", item });
  } catch (error) {
    console.error("togglePaletteItem error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: delete.
exports.deletePaletteItem = async (req, res) => {
  try {
    const deleted = await moodPaletteSchema.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Item not found" });
    return res.status(200).json({ message: "Palette item deleted" });
  } catch (error) {
    console.error("deletePaletteItem error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
