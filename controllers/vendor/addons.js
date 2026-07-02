const addOnsSchema = require("../../models/vendor/addons");

exports.addAddOns = async (req, res) => {
  try {
    const { price, category, service_name, vendor_id, vendor_name, shop_name } =
      req.body;

    const newData = new addOnsSchema({
      price: price,
      category,
      service_name,
      vendor_id,
      vendor_name,
      shop_name,
    });

    await newData.save();

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

exports.getAllAddons = async (req, res) => {
  try {
    const addOns = await addOnsSchema.find().sort({ _id: -1 });
    if (!addOns) {
      console.log("addon's not found");
      return res.status(404).json({ message: "addon's not found" });
    }
    return res.status(200).json({ addOns });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getAddOnsByVendorId = async (req, res) => {
  const vendor_id = req.query.vendor_id;
  const category = req.query.category;
  try {
    const addOns = await addOnsSchema
      .find({
        vendor_id,
        category,
      })
      .sort({ _id: -1 });
    if (!addOns) {
      console.log("addon's not found");
      return res.status(404).json({ message: "addon's not found" });
    }
    return res.status(200).json({ addOns });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteAddOns = async (req, res) => {
  try {
    const _id = req.params.id;
    const addOns = await addOnsSchema.findByIdAndDelete(_id);
    if (!addOns) {
      return res
        .status(404)
        .json({ status: false, message: "addOns not found" });
    }
    return res
      .status(200)
      .send({ status: true, success: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
