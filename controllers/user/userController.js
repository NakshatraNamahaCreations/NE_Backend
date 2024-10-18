const UserSchema = require("../../models/user/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Controller for registering a new user
exports.register = async (req, res) => {
  try {
    const { username, email, mobilenumber, password } = req.body;

    // Check if the user already exists
    const existingUser = await UserSchema.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const existingMobileNumber = await UserSchema.findOne({ mobilenumber });
    if (existingMobileNumber) {
      return res.status(400).json({ message: "Mobile Number already exists" });
    }
    // Hash the password
    // const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new UserSchema({
      username,
      email,
      password: hashedPassword,
      mobilenumber,
    });

    await newUser.save();

    res.status(201).json({ message: "Account Created Successfully!", newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller for user login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    // Find the user by email
    const user = await UserSchema.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "email not match" });
    }
    // console.log("User found:", user);

    // console.log("user", user.password);

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password not match" });
    }
    // const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: "1h",
    // });
    // const refreshToken = jwt.sign(
    //   { id: user._id },
    //   process.env.REFRESH_TOKEN_SECRET,
    //   {
    //     expiresIn: "7d",
    //   }
    // );

    res.status(200).json({
      message: "Login Success",
      user: user,
      // accessToken: accessToken, // Include token if required
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller for getting user profile
exports.getProfile = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await UserSchema.findOne({ _id: userId }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else {
      return res.status(200).json(user);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller for updating user profile
// exports.updateProfile = async (req, res) => {
//   try {
//     const updates = req.body;
//     const user = await UserSchema.findByIdAndUpdate(req.params.id, updates, {
//       new: true,
//     }).select("-password");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.json(user);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      company_type,
      company_name,
      designation,
      gst_number,
      pan_number,
      trand_license,
      cin_number,
    } = req.body;
    let findUser = await UserSchema.findOne({ _id: userId });
    if (!findUser) {
      return res.status(404).json({
        status: 404,
        error: "user not found",
      });
    }
    findUser.company_profile.push({
      company_type,
      company_name,
      designation,
      gst_number,
      pan_number,
      trand_license,
      cin_number,
    });

    let updatedUser = await UserSchema.findOneAndUpdate(
      { _id: userId },
      findUser,
      {
        new: true,
      }
    );
    res.status(200).json({
      status: true,
      success: "Company Details Added",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller for deleting a user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// write a api for save deliver address (saved_address:Array)?
// app.post('/api/save-delivery-address',
exports.addAddress = async (req, res) => {
  try {
    const { saved_address } = req.body;

    // Find the user by ID
    const findUser = await UserSchema.findOne({ _id: req.params.id });

    if (!findUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Update the user's saved_address array by pushing the new address
    const updatedUser = await UserSchema.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { saved_address: saved_address } }, // Use $push to add the new address
      { new: true } // Return the updated document
    );

    res.status(200).json({
      status: true,
      message: "Address saved successfully",
      user: updatedUser, // Optionally return the updated user if needed
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};
