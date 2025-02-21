const { default: axios } = require("axios");
const UserSchema = require("../../models/user/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendSMS } = require("../../utils/sendSMS");
const otpSchema = require("../../models/otp/otp");
const crypto = require("crypto");

// BREVO SEND EMAIL
const apiKey = process.env.SENDINBLUE_API_KEY;
const url = "https://api.brevo.com/v3/smtp/email";

// AIRTEL SEND SMS
// const CUSTOMER_ID = process.env.CUSTOMER_ID;
// const SOURCE_ADDRESS = process.env.SOURCE_ADDRESS;
// const MESSAGE_TYPE = process.env.MESSAGE_TYPE;
// const ENTITY_ID = process.env.ENTITY_ID;
// const AIRTLE_URL = "https://iqsms.airtel.in/api/v1/send-sms";
// const AUTH_HEADDER = process.env.BASE64_AUTH;

const sendOnboardingEmail = async (email, username, mobilenumber, password) => {
  const emailData = {
    sender: {
      name: "Nithyaevent",
      email: "nithyaevents24@gmail.com",
    },
    to: [{ email: email, name: username }],
    subject: "Welcome to Nithyaevent",
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          /* Include your CSS styles here */
        </style>
      </head>
      <body>
        <h4>Dear ${username},</h4>
        <p>Welcome to Nithyaevent! We’re thrilled to have you as a valued partner and look forward to helping you grow your business with us.</p>
        <p>Please log in and complete your profile to proceed further.</p>
        <h4>Your Account Details:</h4>         
        <p><strong>Username:</strong> ${mobilenumber}</p>
        <p><strong>Password:</strong> ${password}</p>
                
        <p>We’re committed to supporting you every step of the way. Let’s work together to create a great experience for your customers!</p>
        <p>Best Regards,</p>
        <p><strong>Support Team</strong><br>Nithyaevent<br><a href="mailto:support@nithyaevents.com">support@nithyaevents.com</a> | 99801370001</p>
        <p>&copy; 2024 All Rights Reserved, Nithyaevent<br>Designed & Developed by Kadagam Ventures Private Limited</p>
      </body>
      </html>
    `,
  };
  try {
    const response = await axios.post(url, emailData, {
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
    });
    console.log("Email sent successfully:", response.data);
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response?.data || error.message
    );
    throw new Error("Failed to send onboarding email");
  }
};

// const sendWelcomeSMS = async (mobilenumber) => {
//   try {
//     // Define the payload
//     let data = JSON.stringify({
//       customerId: CUSTOMER_ID,
//       destinationAddress: mobilenumber,
//       message:
//         "Welcome to NithyaEvent! We're thrilled to have you as a customer. We strive to provide the best service and products, and we're here to assist you with anything you need. Thank you Nithyaeventsupport@nithyaevents.com",
//       sourceAddress: SOURCE_ADDRESS,
//       messageType: MESSAGE_TYPE,
//       dltTemplateId: "1007115106480901552",
//       entityId: ENTITY_ID,
//     });

//     // Define the config
//     let config = {
//       method: "post",
//       url: AIRTLE_URL,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: AUTH_HEADDER,
//       },
//       data: data, // Attach the data
//     };

//     // Make the API call
//     const response = await axios(config);
//     console.log("SMS Sent Successfully:", response.data);
//   } catch (error) {
//     console.error(
//       "Error sending SMS:",
//       error.response ? error.response.data : error.message
//     );
//   }
// };

// Controller for registering a new user

exports.register = async (req, res) => {
  try {
    const { username, email, mobilenumber, password } = req.body;
    const SMS_TYPE = "welcome_template";
    const welcomeMessage =
      "Welcome to NithyaEvent! We're thrilled to have you as a customer. We strive to provide the best service and products, and we're here to assist you with anything you need. Thank you Nithyaeventsupport@nithyaevents.com";

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
    // Send onboarding email
    try {
      await sendOnboardingEmail(email, username, mobilenumber, password);
      //  await sendSMS(mobilenumber, welcomeMessage, SMS_TYPE);
    } catch (error) {
      console.error("Onboarding email error:", error.message);
      return res
        .status(500)
        .json({ message: "Account created, but failed to send email" });
    }
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

exports.loginWithMobileNumber = async (req, res) => {
  const { mobilenumber } = req.body;
  const SMS_TYPE = "otp_template";
  try {
    if (!mobilenumber) {
      return res.status(400).json({ error: "Mobilenumber is required" });
    }

    const user = await UserSchema.findOne({ mobilenumber });
    if (!user) {
      console.log("mobilenumber not match");
      return res.status(400).json({ message: "Mobile Number doesn't exists" });
    }
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   console.log("Password not match");
    //   return res.status(400).json({ message: "Password doesn't exists" });
    // }

    const otp = crypto.randomInt(100000, 999999);
    const expiry = new Date(Date.now() + 60 * 1000);

    await otpSchema.create({ mobilenumber, otp, expiry });
    // const otpMessage = `Hello ${user.username},Your one-time password (OTP) for registration is ${otp}. This code is valid for the next 60 secondsPlease enter this code to proceed with your action. If you did not request this OTP, please disregard this message.NithyaEvents`;
    const otpMessage = `Hello Naveen,Your one-time password (OTP) for registration is ${otp}. This code is valid for the next 60 secondsPlease enter this code to proceed with your action. If you did not request this OTP, please disregard this message.NithyaEvents`;

    // const smsResponse = await sendSMS(mobilenumber, otpMessage, SMS_TYPE);
    // console.log("smsResponse", smsResponse);

    // if (!smsResponse.success) {
    //   return res.status(500).json({ message: "Failed to send OTP" });
    // }

    res.status(200).json({
      message: "Login successful. OTP sent to your mobile number.",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resendOTP = async (req, res) => {
  const { mobilenumber } = req.body;
  const SMS_TYPE = "otp_template";
  try {
    const user = await UserSchema.findOne({ mobilenumber });
    if (!user) {
      console.log("Mobile Number not match");
      return res.status(400).json({ message: "mobile number not match" });
    }

    const otp = crypto.randomInt(100000, 999999);
    const expiry = new Date(Date.now() + 60 * 1000);

    await otpSchema.create({ mobilenumber, otp, expiry });
    // const otpMessage = `Hello ${user.username},Your one-time password (OTP) for registration is ${otp}. This code is valid for the next 60 secondsPlease enter this code to proceed with your action. If you did not request this OTP, please disregard this message.NithyaEvents`;
    const otpMessage = `Hello Naveen,Your one-time password (OTP) for registration is ${otp}. This code is valid for the next 60 secondsPlease enter this code to proceed with your action. If you did not request this OTP, please disregard this message.NithyaEvents`;

    const smsResponse = await sendSMS(mobilenumber, otpMessage, SMS_TYPE);

    if (!smsResponse.success) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    res.status(200).json({
      message: "OTP Resent",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOTP = async (req, res) => {
  const { mobilenumber, otp } = req.body;
  try {
    const record = await otpSchema.findOne({ mobilenumber, otp });
    if (!record) {
      console.log("Invalid OTP");
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (record.expiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }
    await otpSchema.deleteMany({ mobilenumber });
    res.status(200).json({ message: "OTP verified successfully" });
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

exports.getAllUser = async (req, res) => {
  try {
    const user = await UserSchema.find().select("-password");
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    } else {
      return res.status(200).json(user);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

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
    if (req.body.pan_front_image) {
      findUser.pan_front_image = req.body.pan_front_image;
    }
    if (req.body.pan_back_image) {
      findUser.pan_back_image = req.body.pan_back_image;
    }

    findUser.company_profile.push({
      company_type,
      company_name,
      designation,
      gst_number,
      pan_number,
      trand_license,
      cin_number,
      pan_front_image: req.body.pan_front_image,
      pan_back_image: req.body.pan_back_image,
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
