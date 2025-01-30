const { default: axios } = require("axios");
// BREVO SEND EMAIL
const apiKey = process.env.SENDINBLUE_API_KEY;
const url = "https://api.brevo.com/v3/smtp/email";

exports.sendOnboardingEmail = async (
  email,
  username,
  mobilenumber,
  password
) => {
  const emailData = {
    sender: {
      name: "Kadagam Ventures Private Limited",
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

exports.sendOTPForForgotPassword = async (email, otp) => {
  const emailData = {
    sender: {
      name: "Kadagam Ventures Private Limited",
      email: "nithyaevents24@gmail.com",
    },
    to: [{ email: email }],
    subject: "Security Code",
    htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            /* Include your CSS styles here */
          </style>
        </head>
        <body>
          <h4>Hi,</h4>
          <p>Here is the security code to verify your account</p>
           
          <h2>${otp}</h2>         
          <p>IF you have not request for this, please ingnore this message.</p>
                   
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
    throw new Error("Failed to send opt in email");
  }
};
