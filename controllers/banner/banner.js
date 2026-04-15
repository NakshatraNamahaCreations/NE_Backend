const bannerSchema = require("../../models/banner/banner");

exports.createBanner = async (req, res) => {
  try {
    // Extract the uploaded file URL from req.body
    const bannerImage = req.body.bannerImg;

    // Validate if the image URL exists
    if (!bannerImage) {
      return res.status(400).json({
        status: false,
        error: "Please select a banner image",
      });
    }

    // Create a new banner document with the S3 URL
    const banner = new bannerSchema({
      banner_image: bannerImage,
    });

    // Save the banner to the database
    await banner.save();

    // Send success response
    res.status(200).json({
      status: true,
      success: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};

// exports.createBanner = async (req, res) => {
//   try {
//     // Extract the uploaded file name
//     let file = req.file?.filename;

//     // Validate file existence
//     if (!file) {
//       return res.status(400).json({
//         status: false,
//         error: "Please select a banner image",
//       });
//     }

//     // Create banner document
//     const banner = new bannerSchema({
//       banner_image: file,
//     });

//     // Save the banner to the database
//     await banner.save();

//     // Send success response
//     res.status(200).json({
//       status: true,
//       success: "Banner created successfully",
//       data: banner,
//     });
//   } catch (error) {
//     // Catch and handle errors
//     res.status(500).json({
//       status: false,
//       error: error.message,
//     });
//   }
// };

exports.getBanners = async (req, res) => {
  try {
    const data = await bannerSchema.find();
    if (data.length < 0) {
      return res.status(404).json({ message: "banner's not found" });
    } else {
      res.status(200).json({ message: "success", data: data });
    }
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
