const youtubeVideoSchema = require("../../models/article/youtube");

exports.addYoutubeLink = async (req, res) => {
  try {
    const { video_link } = req.body;

    const newVideo = new youtubeVideoSchema({
      video_link,
      isVideoActive: true,
    });
    await newVideo.save();
    res.status(200).json({
      message: "Added",
      data: newVideo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllVideoLink = async (req, res) => {
  try {
    const link = await youtubeVideoSchema.find();
    if (link.length === 0) {
      return res.status(404).json({ message: "link list not found" });
    } else {
      return res.status(200).json({ data: link });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getActiveLink = async (req, res) => {
  try {
    const link = await youtubeVideoSchema.find({ isVideoActive: true });
    if (link.length === 0) {
      return res.status(404).json({ message: "link list not found" });
    } else {
      return res.status(200).json({ data: link });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getLinkById = async (req, res) => {
  try {
    const link = await youtubeVideoSchema.find({ _id: req.params.id });
    if (!link) {
      return res.status(404).json({ message: "link not found" });
    } else {
      return res.status(200).json({ data: link });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteLink = async (req, res) => {
  try {
    const _id = req.params.id;
    const link = await youtubeVideoSchema.findByIdAndDelete(_id);
    if (!link) {
      return res.status(404).json({ status: false, message: "link not found" });
    }
    return res.status(200).send({ status: true, success: "Link deleted!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.activeStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedLink = await youtubeVideoSchema.findByIdAndUpdate(
      id,
      { isVideoActive: true },
      { new: true }
    );

    if (!updatedLink) {
      return res.status(404).json({ message: "link not found" });
    }

    res.status(200).json({
      message: "Url Active",
      data: updatedLink,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.inActiveStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedLink = await youtubeVideoSchema.findByIdAndUpdate(
      id,
      { isVideoActive: false },
      { new: true }
    );
    if (!updatedLink) {
      return res.status(404).json({ message: "link not found" });
    }
    res.status(200).json({
      message: "Url Inactive",
      data: updatedLink,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
