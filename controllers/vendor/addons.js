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
  const { vendor_id, category } = req.query;

  try {
    if (!vendor_id) {
      return res.status(400).json({ message: "vendor_id is required" });
    }

    const query = { vendor_id };

    if (category) {
      query.category = { $regex: new RegExp(category, "i") };
    }

    const addOns = await addOnsSchema.find(query).sort({ _id: -1 });

    if (!addOns || addOns.length === 0) {
      return res.status(404).json({ message: "add-ons not found" });
    }

    return res.status(200).json({ addOns });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.editAddons = async (req, res) => {
  try {
    const itemId = req.params.id;
    const existingItem = await addOnsSchema.findById(itemId);

    if (!existingItem) {
      return res.status(404).json({ message: "Addon not found" });
    }

    const { category, service_name, price } = req.body;

    existingItem.category = category || existingItem.category;
    existingItem.service_name = service_name || existingItem.service_name;
    existingItem.price = price || existingItem.price;

    const updateAddons = await existingItem.save();

    res.status(200).json({
      message: "Details updated successfully",
      status: true,
      data: updateAddons,
    });
  } catch (error) {
    console.error("Edit Addmons Error:", error);
    res.status(500).json({ message: "Server error" });
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
      .json({ status: true, success: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
