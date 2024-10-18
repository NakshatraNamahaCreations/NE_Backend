const teamSchema = require("../../models/team/team");

exports.createTeam = async (req, res) => {
  try {
    const {
      member_name,
      mobile_number,
      password,
      dashboard,
      // banner,
      booking_management,
      user_management,
      vendor_management,
      team_management,
    } = req.body;

    const existingMobileNumber = await teamSchema.findOne({ mobile_number });
    if (existingMobileNumber) {
      return res.status(400).json({ message: "Mobile Number already exists" });
    }

    const newUser = new teamSchema({
      member_name,
      mobile_number,
      password,
      dashboard,
      // banner,
      booking_management,
      user_management,
      vendor_management,
      team_management,
    });
    await newUser.save();
    res.status(200).json({ message: "User registered successfully", newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTeam = async (req, res) => {
  try {
    const user = await teamSchema.find();
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    } else {
      res.status(200).json({ team: user });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const memberId = req.params.id;
    const user = await teamSchema.findOne({ _id: memberId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else {
      res.status(200).json({ user });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.blockMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    const user = await teamSchema.findOne({ _id: memberId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isBlocked = true;
    await user.save();
    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.unblockMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    const user = await teamSchema.findOne({ _id: memberId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isBlocked = false;
    await user.save();
    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const {
      member_name,
      mobile_number,
      password,
      dashboard,
      // banner,
      booking_management,
      user_management,
      vendor_management,
      team_management,
    } = req.body;
    const memberId = req.params.id;
    const user = await teamSchema.findOne({ _id: memberId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.member_name = member_name || user.member_name;
    user.mobile_number = mobile_number || user.mobile_number;
    user.password = password || user.password;
    user.dashboard = dashboard || user.dashboard;
    // // // user.banner = banner || user.banner;
    user.booking_management = booking_management || user.booking_management;
    user.user_management = user_management || user.user_management;
    user.vendor_management = vendor_management || user.vendor_management;
    user.team_management = team_management || user.team_management;
    let updateUser = await teamSchema.findOneAndUpdate(
      { _id: memberId },
      user,
      {
        new: true,
      }
    );
    res.status(200).json({
      message: "User updated successfully",
      status: true,
      data: updateUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
