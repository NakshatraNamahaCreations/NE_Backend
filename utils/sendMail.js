const { default: axios } = require("axios");

const apiKey = process.env.SENDINBLUE_API_KEY;
const url = "https://api.brevo.com/v3/smtp/email";

exports.sendOTP = async (email, otp, username) => {
  const emailData = {
    sender: {
      name: "Nithyaevent",
      // email: "support@nithyaevents.com",
      email: "nithyaevents24@gmail.com",
    },
    to: [{ email: email, name: username }],
    subject: "Reset Password - OTP",
    htmlContent: `
      <!DOCTYPE html>
<html>
 <style> 
    .body-text {
      font-size: 16px;
    }
  </style>
  <body>
    <h4 style="font-family: Verdana, Geneva, Tahoma, sans-serif; font-size: 20px">Email OTP</h4>

    <p class="body-text">Your One-Time Password (OTP) is:</p>
    <button
      style="
        background-color: #e91e63;
        border: 1px solid transparent;
        padding: 10px 25px;
        font-size: 20px;
        letter-spacing: 5px;
        color: white;
      "
    >
      ${otp}
    </button>
    <p class="body-text">
      Please use this OTP to reset your password. Do not share this code with
      anyone.
    </p>

    <p class="body-text">Best Regards,</p>
    <p class="body-text">
      <strong>Support Team</strong><br />Nithyaevent<br /><a
        href="mailto:support@nithyaevents.com"
        >support@nithyaevents.com</a
      >
      | 9980137000
    </p>
    <p class="body-text">
      &copy; 2024 All Rights Reserved, Nithyaevent<br />Designed & Developed by
      Kadagam Ventures Private Limited
    </p>
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

exports.sendResetMessage = async (email, userName) => {
  const emailData = {
    sender: {
      name: "Nithyaevent",
      email: "nithyaevents24@gmail.com",
    },
    to: [{ email: email, name: userName }],
    subject: "Password Reset Successful",
    htmlContent: `
      <!DOCTYPE html>
<html>
 <style> 
    .body-text {
      font-size: 16px;
    }
      .body-footer-text{
      font-size:14px;
      }
  </style>
  <body>

    <p class="body-text">Dear ${userName} </p>

    <p class="body-text">Your password has been successfully reset.</p>
     
     
    <p class="body-footer-text">
      <strong>Support Team</strong><br />Nithyaevent<br /><a
        href="mailto:support@nithyaevents.com"
        >support@nithyaevents.com</a
      >
      | 9980137000
    </p>
    <p class="body-footer-text">
      &copy; 2024 All Rights Reserved, Nithyaevent<br />Designed & Developed by
      Kadagam Ventures Private Limited
    </p>
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
