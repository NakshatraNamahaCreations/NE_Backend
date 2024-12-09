const citySchema = require("../../models/master/city");

exports.addCity = async (req, res) => {
  try {
    const { state_name, state_id, city_code, city_name } = req.body;

    const newCity = new citySchema({
      state_name,
      state_id,
      city_code,
      city_name,
      isCityActive: true,
    });
    await newCity.save();
    res.status(200).json({
      message: "Added",
      data: newCity,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllCity = async (req, res) => {
  try {
    const city = await citySchema.find();
    if (city.length === 0) {
      return res.status(404).json({ message: "city list not found" });
    } else {
      return res.status(200).json({ data: city });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getActiveCities = async (req, res) => {
  try {
    const city = await citySchema.find({ isCityActive: true });
    if (city.length === 0) {
      return res.status(404).json({ message: "city list not found" });
    } else {
      return res.status(200).json({ data: city });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCityById = async (req, res) => {
  try {
    const city = await citySchema.find({ _id: req.params.id });
    if (!city) {
      return res.status(404).json({ message: "city not found" });
    } else {
      return res.status(200).json({ data: city });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteCity = async (req, res) => {
  try {
    const _id = req.params.id;
    const city = await citySchema.findByIdAndDelete(_id);
    if (!city) {
      return res.status(404).json({ status: false, message: "city not found" });
    }
    return res
      .status(200)
      .send({ status: true, success: "city deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.activeStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedCity = await citySchema.findByIdAndUpdate(
      id,
      { isCityActive: true },
      { new: true }
    );

    if (!updatedCity) {
      return res.status(404).json({ message: "city not found" });
    }

    res.status(200).json({
      message: "city status updated successfully",
      data: updatedCity,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.inActiveStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCity = await citySchema.findByIdAndUpdate(
      id,
      { isCityActive: false },
      { new: true }
    );
    if (!updatedCity) {
      return res.status(404).json({ message: "city not found" });
    }
    res.status(200).json({
      message: "city status updated successfully",
      data: updatedCity,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
