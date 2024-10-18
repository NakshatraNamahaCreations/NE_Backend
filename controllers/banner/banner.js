const bannerSchema = require("../../models/banner/banner");

exports.createBanner = async (req, res) => {
  try {
    const { banner_type } = req.body;
    let file = req.file?.filename;
    const banner = new bannerSchema({
      banner_type,
      bannerImage: file,
    });
    if (!file) {
      return res.status(500).json({
        status: 500,
        error: "Please select banner image",
      });
    }
    await banner.save();
    res.status(200).json({
      status: true,
      success: "banner created successfully",
      data: banner,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBanners = async (req, res) => {
  try {
    let data = await bannerSchema.find();
    res.status(200).json({ message: "success", data: data });
  } catch (err) {
    console.log("error", err);
    res.status(400).json({ message: "fail" });
  }
};

exports.deleteBanners = async (req, res) => {
  try {
    const _id = req.params.id;
    const banner = await bannerSchema.findByIdAndDelete(_id);
    if (!banner) {
      return res
        .status(404)
        .json({ status: false, message: "Banner not found" });
    }
    return res
      .status(200)
      .send({ status: true, success: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
