const companyAddressSchema = require("../../models/master/address");

exports.addAddress = async (req, res) => {
  try {
    const {
      state_name,
      state_id,
      city_id,
      contact_phone,
      city_name,
      address,
      contact_email,
    } = req.body;

    const newAddress = new companyAddressSchema({
      state_name,
      state_id,
      city_id,
      city_name,
      address,
      contact_email,
      contact_phone,
      isAddressActive: true,
    });
    await newAddress.save();
    res.status(200).json({
      message: "Added",
      data: newAddress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllAddress = async (req, res) => {
  try {
    const address = await companyAddressSchema.find();
    if (address.length === 0) {
      return res.status(404).json({ message: "address list not found" });
    } else {
      return res.status(200).json({ data: address });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getActiveAddress = async (req, res) => {
  try {
    const address = await companyAddressSchema.find({ isAddressActive: true });
    if (address.length === 0) {
      return res.status(404).json({ message: "address list not found" });
    } else {
      return res.status(200).json({ data: address });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAddressById = async (req, res) => {
  try {
    const address = await companyAddressSchema.find({ _id: req.params.id });
    if (!address) {
      return res.status(404).json({ message: "address not found" });
    } else {
      return res.status(200).json({ data: address });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const _id = req.params.id;
    const address = await companyAddressSchema.findByIdAndDelete(_id);
    if (!address) {
      return res
        .status(404)
        .json({ status: false, message: "address not found" });
    }
    return res
      .status(200)
      .send({ status: true, success: "address deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.activeStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedAddress = await companyAddressSchema.findByIdAndUpdate(
      id,
      { isAddressActive: true },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({ message: "address not found" });
    }

    res.status(200).json({
      message: "address status updated successfully",
      data: updatedAddress,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.inActiveStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedAddress = await companyAddressSchema.findByIdAndUpdate(
      id,
      { isAddressActive: false },
      { new: true }
    );
    if (!updatedAddress) {
      return res.status(404).json({ message: "address not found" });
    }
    res.status(200).json({
      message: "address status updated successfully",
      data: updatedAddress,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
