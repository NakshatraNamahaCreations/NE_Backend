const { default: axios } = require("axios");
const teamSchema = require("../../models/team/team");
const apiKey = process.env.SENDINBLUE_API_KEY;
const url = "https://api.brevo.com/v3/smtp/email";

const sendTeamCredentialEmail = async (
  email_id,
  member_name,
  mobile_number,
  password
) => {
  const emailData = {
    sender: {
      name: "Kadagam Ventures Private Limited",
      email: "nithyaevents24@gmail.com",
    },
    to: [{ email: email_id, name: member_name }],
    subject: "Welcome to Nithyaevent Admin Panel - Your Login Credentials!",
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
      </head>
      <body>
        <h4>Dear ${member_name},</h4>
        <p>Your profile has been created by the Nithyaevent Admin to access the Nithyaevent Admin Panel.</p>
        <p>Please find your login credentials below</p> 
        <p><strong>Username:</strong> ${member_name}</p>
        <p><strong>Mobile Number:</strong> ${mobile_number}</p>
        <p><strong>Email ID:</strong> ${email_id}</p>
        <p><strong>Password:</strong> ${password}</p>
         
        <p><strong>Admin Panel Link:</strong> <a href="https://admin.nithyaevent.com">Click here to access the Admin Panel</a></p>
        
        <p>If you have any questions or require assistance, feel free to contact our support team.</p>

        <p>Best Regards,</p>
        <p><strong>Support Team</strong><br>Nithyaevent<br><a href="mailto:support@nithyaevent.com">support@nithyaevent.com</a> | 8867999997</p>
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

exports.createTeam = async (req, res) => {
  try {
    const {
      member_name,
      mobile_number,
      email_id,
      password,
      // dashboard_management,
      banner_management,
      profile,
      billing_address,
      state,
      city,
      service_management,
      subservice_management,
      requirement_management,
      userbooking_management,
      vendororder_management,
      manage_user,
      manage_vendor,
      manage_teammemebrs,
      manage_sellproducts,
      manage_rentalproducts,
      event_report,
      calculate,
      cancel_event,
      reschedule_event,
      ticket_raised,
      pyout_config,
      product_payout,
      service_payout,
      tech_payout,
      faq,
      tnc,
      youtube_video,
    } = req.body;

    const existingMobileNumber = await teamSchema.findOne({ mobile_number });
    if (existingMobileNumber) {
      return res.status(400).json({ message: "Mobile Number already exists" });
    }

    const existingEmailId = await teamSchema.findOne({ email_id });
    if (existingEmailId) {
      return res.status(400).json({ message: "Email ID already exists" });
    }

    const newUser = new teamSchema({
      member_name,
      mobile_number,
      password,
      email_id,
      // dashboard_management,
      banner_management,
      profile,
      billing_address,
      state,
      city,
      service_management,
      subservice_management,
      requirement_management,
      userbooking_management,
      vendororder_management,
      manage_user,
      manage_vendor,
      manage_teammemebrs,
      manage_sellproducts,
      manage_rentalproducts,
      event_report,
      calculate,
      cancel_event,
      reschedule_event,
      ticket_raised,
      pyout_config,
      product_payout,
      service_payout,
      tech_payout,
      faq,
      tnc,
      youtube_video,
    });
    await newUser.save();
    try {
      await sendTeamCredentialEmail(
        email_id,
        member_name,
        mobile_number,
        password
      );
    } catch (error) {
      console.log("credential error:", error);
      return res
        .status(500)
        .json({ message: "Failed to send the credential email" });
    }
    res.status(200).json({ message: "User Created successfully", newUser });
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

exports.teamUserLogin = async (req, res) => {
  const { mobile_number, password } = req.body;
  try {
    if (!mobile_number || !password) {
      return res
        .status(400)
        .json({ error: "Mobile number and password are required" });
    }

    const user = await teamSchema.findOne({ mobile_number });
    if (!user) {
      return res.status(400).json({ message: "Mobile number does not match" });
    }
    if (user.password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    if (user.isBlocked === true) {
      return res.status(400).json({
        message: "Your account has been blocked by admin",
      });
    }
    res.status(200).json({
      message: "Login Success",
      user: user,
    });
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
      email_id,
      password,
      dashboard_management,
      banner_management,
      service_management,
      subservice_management,
      requirement_management,
      userbooking_management,
      vendororder_management,
      manage_user,
      manage_vendor,
      manage_teammemebrs,
      manage_sellproducts,
      manage_rentalproducts,
    } = req.body;
    const memberId = req.params.id;
    const user = await teamSchema.findOne({ _id: memberId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.member_name = member_name || user.member_name;
    user.mobile_number = mobile_number || user.mobile_number;
    user.password = password || user.password;
    user.email_id = email_id || user.email_id;
    user.dashboard_management =
      dashboard_management || user.dashboard_management;
    user.banner_management = banner_management || user.banner_management;
    user.service_management = service_management || user.service_management;
    user.subservice_management =
      subservice_management || user.subservice_management;
    user.requirement_management =
      requirement_management || user.requirement_management;
    user.userbooking_management =
      userbooking_management || user.userbooking_management;
    user.vendororder_management =
      vendororder_management || user.vendororder_management;
    user.manage_user = manage_user || user.manage_user;
    user.manage_vendor = manage_vendor || user.manage_vendor;
    user.manage_teammemebrs = manage_teammemebrs || user.manage_teammemebrs;
    user.manage_sellproducts = manage_sellproducts || user.manage_sellproducts;
    user.manage_rentalproducts =
      manage_rentalproducts || user.manage_rentalproducts;
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

exports.deleteTeamUser = async (req, res) => {
  try {
    const _id = req.params.id;
    const teamUser = await teamSchema.findByIdAndDelete(_id);
    if (!teamUser) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    return res
      .status(200)
      .send({ status: true, success: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
