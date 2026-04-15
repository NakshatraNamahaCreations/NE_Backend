const technicianShcema = require("../../models/master/technician");

exports.addTechnician = async (req, res) => {
  try {
    const {
      price,
      category,
      service_name,
      vendor_id,
      vendor_name,
      shop_name,
      tech_name,
    } = req.body;

    // const bannerImage = req.body.banner_image;

    // if (!bannerImage) {
    //   return res.status(400).json({
    //     status: false,
    //     error: "Please select a banner image",
    //   });
    // }

    const newData = new technicianShcema({
      // banner_image: bannerImage,
      price: price,
      category: category,
      service_name: service_name,
      vendor_id: vendor_id,
      vendor_name: vendor_name,
      shop_name: shop_name,
      tech_name: tech_name,
    });

    await newData.save();
    console.log("tech added");
    res.status(200).json({
      status: true,
      success: "Added",
      data: newData,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};

exports.getAllTech = async (req, res) => {
  try {
    const tech = await technicianShcema.find().sort({ _id: -1 });
    if (!tech) {
      return res.status(404).json({ message: "tech not found" });
    } else {
      res.status(200).json({ tech });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTechByVendorId = async (req, res) => {
  try {
    const tech = await technicianShcema
      .find({
        vendor_id: req.params.id,
      })
      .sort({ _id: -1 });
    if (!tech) {
      return res.status(404).json({ message: "tech not found" });
    } else {
      return res.status(200).json({ tech });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteTechnician = async (req, res) => {
  try {
    const _id = req.params.id;
    const tech = await technicianShcema.findByIdAndDelete(_id);
    if (!tech) {
      return res.status(404).json({ status: false, message: "tech not found" });
    }
    return res
      .status(200)
      .send({ status: true, success: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.editTechnician = async (req, res) => {
  try {
    const technicianId = req.params.id;
    const existingTech = await technicianShcema.findById(technicianId);

    if (!existingTech) {
      return res.status(404).json({ message: "Technician not found" });
    }

    const { category, service_name, tech_name, price } = req.body;

    existingTech.category = category || existingTech.category;
    existingTech.service_name = service_name || existingTech.service_name;
    existingTech.tech_name = tech_name || existingTech.tech_name;
    existingTech.price = price || existingTech.price;

    const updatedTech = await existingTech.save();

    res.status(200).json({
      message: "Technician updated successfully",
      status: true,
      data: updatedTech,
    });
  } catch (error) {
    console.error("Edit Technician Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};