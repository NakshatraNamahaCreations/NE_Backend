const { default: axios } = require("axios");

// AIRTEL SEND SMS
const CUSTOMER_ID = process.env.CUSTOMER_ID;
const SOURCE_ADDRESS = process.env.SOURCE_ADDRESS;
const MESSAGE_TYPE = process.env.MESSAGE_TYPE;
const ENTITY_ID = process.env.ENTITY_ID;
const AIRTLE_URL = "https://iqsms.airtel.in/api/v1/send-sms";
const AUTH_HEADDER = process.env.BASE64_AUTH;

exports.sendSMS = async (mobilenumber, message, SMS_TYPE) => {
  try {
    // Define the payload
    let data = JSON.stringify({
      customerId: CUSTOMER_ID,
      destinationAddress: mobilenumber,
      message,
      sourceAddress: SOURCE_ADDRESS,
      messageType: MESSAGE_TYPE,
      dltTemplateId:
        SMS_TYPE === "welcome_template"
          ? "1007115106480901552"
          : SMS_TYPE === "otp_template"
          ? "1007622509300482217"
          : SMS_TYPE === "delivery_template"
          ? "1007108509874790937"
          : null,
      entityId: ENTITY_ID,
    });

    let config = {
      method: "post",
      url: AIRTLE_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_HEADDER,
      },
      data: data,
    };

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      "Error sending SMS:",
      error.response ? error.response.data : error.message
    );
  }
};

// exports.sendWelcomeSMS = async (mobilenumber, message) => {
//   try {
//     // Define the payload
//     let data = JSON.stringify({
//       customerId: CUSTOMER_ID,
//       destinationAddress: mobilenumber,
//       message,
//       sourceAddress: SOURCE_ADDRESS,
//       messageType: MESSAGE_TYPE,
//       dltTemplateId: "1007115106480901552",
//       entityId: ENTITY_ID,
//     });

//     let config = {
//       method: "post",
//       url: AIRTLE_URL,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: AUTH_HEADDER,
//       },
//       data: data,
//     };

//     const response = await axios(config);
//     return { success: true, data: response.data };
//   } catch (error) {
//     console.error(
//       "Error sending SMS:",
//       error.response ? error.response.data : error.message
//     );
//   }
// };
// exports.sendOTP = async (mobilenumber, message) => {
//   try {
//     const data = {
//       customerId: CUSTOMER_ID,
//       destinationAddress: mobilenumber,
//       message,
//       sourceAddress: SOURCE_ADDRESS,
//       messageType: MESSAGE_TYPE,
//       dltTemplateId: "1007622509300482217",
//       entityId: ENTITY_ID,
//     };

//     let config = {
//       method: "post",
//       url: AIRTLE_URL,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: AUTH_HEADDER,
//       },
//       data: data,
//     };

//     const response = await axios(config);
//     console.log("otp response:", response.data);
//     return { success: true, data: response.data };
//   } catch (error) {
//     console.error("Error sending SMS:", error);
//     return { success: false, error };
//   }
// };
