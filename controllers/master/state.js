const stateSchema = require("../../models/master/state");

exports.addState = async (req, res) => {
  try {
    const { state_name, state_code } = req.body;

    const newState = new stateSchema({
      state_name,
      state_code,
      isStateActive: true,
    });
    await newState.save();
    res.status(200).json({
      message: "Added",
      data: newState,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllStates = async (req, res) => {
  try {
    const state = await stateSchema.find();
    if (state.length === 0) {
      return res.status(404).json({ message: "state list not found" });
    } else {
      return res.status(200).json({ data: state });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getActiveStates = async (req, res) => {
  try {
    const state = await stateSchema.find({ isStateActive: true });
    if (state.length === 0) {
      return res.status(404).json({ message: "state list not found" });
    } else {
      return res.status(200).json({ data: state });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStatesById = async (req, res) => {
  try {
    const state = await stateSchema.find({ _id: req.params.id });
    if (!state) {
      return res.status(404).json({ message: "state not found" });
    } else {
      return res.status(200).json({ data: state });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteState = async (req, res) => {
  try {
    const _id = req.params.id;
    const state = await stateSchema.findByIdAndDelete(_id);
    if (!state) {
      return res
        .status(404)
        .json({ status: false, message: "state not found" });
    }
    return res
      .status(200)
      .send({ status: true, success: "state deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.activeStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedState = await stateSchema.findByIdAndUpdate(
      id,
      { isStateActive: true },
      { new: true }
    );

    if (!updatedState) {
      return res.status(404).json({ message: "State not found" });
    }

    res.status(200).json({
      message: "State status updated successfully",
      data: updatedState,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.inActiveStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedState = await stateSchema.findByIdAndUpdate(
      id,
      { isStateActive: false },
      { new: true }
    );

    if (!updatedState) {
      return res.status(404).json({ message: "State not found" });
    }

    res.status(200).json({
      message: "State status updated successfully",
      data: updatedState,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
