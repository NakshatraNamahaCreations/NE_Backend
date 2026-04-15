const { default: axios } = require("axios");

const apiKey = process.env.SENDINBLUE_API_KEY;
const url = "https://api.brevo.com/v3/smtp/email";

exports.sendProfileReviewStatus = async ({ email, username, review_status, reason }) => {
  try {
    if (!email) throw new Error("email is required");
    if (!username) throw new Error("username is required");
    if (!review_status) throw new Error("review_status is required");

    const status = String(review_status).toLowerCase(); // "approved" / "disapproved"
    const isApproved = status === "approved";

    const brandName = "Nithyaevent";

    const subject = isApproved
      ? `${brandName}: Your vendor profile has been approved ✅`
      : `${brandName}: Your vendor profile has been disapproved ❌`;

    const heading = isApproved ? "Profile Approved" : "Profile Disapproved";
    const intro = isApproved
      ? `Hi ${username}, your vendor profile has been approved. You can now start accepting bookings.`
      : `Hi ${username}, your vendor profile was disapproved. Please review the reason below`;

    const reasonBlock = !isApproved
      ? `
        <div style="margin-top:14px; padding:12px; border:1px solid #f3c2c2; background:#fff5f5; border-radius:8px;">
          <p style="margin:0; font-size:14px;"><b>Reason:</b></p>
          <p style="margin:6px 0 0; font-size:14px; line-height:20px;">
            ${reason ? String(reason) : "No reason provided. Please contact support."}
          </p>
        </div>
      `
      : "";

    // const ctaBlock = isApproved
    //   ? `
    //     <a href="https://nithyaevents.com/vendor/login"
    //        style="display:inline-block; margin-top:16px; background:#16a34a; color:#fff; text-decoration:none; padding:10px 18px; border-radius:8px; font-weight:600;">
    //       Login to Vendor Panel
    //     </a>
    //   `
    //   : `
    //     <a href="https://nithyaevents.com/vendor/profile"
    //        style="display:inline-block; margin-top:16px; background:#e11d48; color:#fff; text-decoration:none; padding:10px 18px; border-radius:8px; font-weight:600;">
    //       Update My Profile
    //     </a>
    //   `;

    const emailData = {
      sender: {
        name: brandName,
        email: "nithyaevents24@gmail.com",
      },
      to: [{ email, name: username }],
      subject,
      htmlContent: `
<!DOCTYPE html>
<html>
  <body style="font-family: Verdana, Geneva, Tahoma, sans-serif; background:#f7f7f7; padding:20px;">
    <div style="max-width:620px; margin:0 auto; background:#ffffff; border-radius:12px; padding:22px; border:1px solid #eee;">
      <h2 style="margin:0 0 10px; font-size:20px; color:#111;">${heading}</h2>

      <p style="margin:0; font-size:14px; color:#333; line-height:22px;">
        ${intro}
      </p>

      ${reasonBlock}

      <hr style="border:none; border-top:1px solid #eee; margin:18px 0;" />

      <p style="margin:0; font-size:13px; color:#555; line-height:20px;">
        Best Regards,<br/>
        <b>Support Team</b><br/>
        Nithyaevent<br/>
        <a href="mailto:support@nithyaevents.com">support@nithyaevents.com</a> | 9980137000
      </p>

      <p style="margin:12px 0 0; font-size:12px; color:#888; line-height:18px;">
        © ${new Date().getFullYear()} All Rights Reserved, Nithyaevent<br/>
        Designed & Developed by Kadagam Ventures Private Limited
      </p>
    </div>
  </body>
</html>
      `,
    };

    const response = await axios.post(url, emailData, {
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
    });

    console.log("Profile review email sent:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "sendProfileReviewStatus error:",
      error?.response?.data || error.message
    );
    throw error; // keep original error message
  }
};
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
