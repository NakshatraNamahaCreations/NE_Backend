// const crypto = require("crypto");
// const CryptoJS = require("crypto-js");
// const axios = require("axios");
// const sha256 = require("sha256");
// const { v4: uuidv4 } = require("uuid");
// const paymentGatewayModal = require("../../models/payment/Payment");

// // exports.initiatePayment = async (req, res) => {
// //   const transactionId = uuidv4();

// //   try {
// //     const amount = 100;
// //     const serviceId = 4875634875634;
// //     const vendorId = "67f39b84c961825d0d036535";
// //     const number = "8526190332";

// //     if (!vendorId || !amount) {
// //       return res.status(400).json({ error: "Please try again later" });
// //     }

// //     // Ensure amount is a valid number
// //     if (isNaN(amount) || amount <= 0) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Invalid amount. Please provide a valid positive number.",
// //       });
// //     }

// //     const base64 = Buffer.from(
// //       JSON.stringify({
// //         merchantId: "M22E0HWMLLIYY",
// //         merchantTransactionId: transactionId,
// //         merchantUserId: "MUID" + Date.now(),
// //         amount,
// //         redirectUrl: `http://192.168.1.186:9000/api/payment/status/M22E0HWMLLIYY/${transactionId}/${vendorId}/${amount}`,
// //         redirectMode: "POST",
// //         mobileNumber: number,
// //         paymentInstrument: {
// //           type: "PAY_PAGE",
// //         },
// //       })
// //     ).toString("base64");

// //     const sha256encode =
// //       sha256(base64 + "/pg/v1/payecd74096-c2ad-4989-bcca-69a1c9d8deec") +
// //       "###1";

// //     // Save payment details to the database
// //     const newPayment = new paymentGatewayModal({
// //       amount,
// //       serviceId,
// //     });

// //     await newPayment.save();

// //     // return res.status(200).json({
// //     //   success: true,
// //     //   message: "Payment initiated successfully",
// //     //   base64,
// //     //   sha256encode,
// //     //   merchantId: "M1PX7BZG1R4G",
// //     //   merchantTransactionId: transactionId,
// //     // });
// //     res.status(200).json({
// //       success: true,
// //       paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
// //       merchantTransactionId: transactionId,
// //     });
// //   } catch (error) {
// //     console.error("Error initiating payment:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Payment initiation failed. Please try again.",
// //     });
// //   }
// // };

// const MERCHANT_ID = "M22E0HWMLLIYY";
// const SALT_KEY = "ecd74096-c2ad-4989-bcca-69a1c9d8deec";
// const SALT_INDEX = 1;
// const PHONEPE_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";

// exports.initiatePayment = async (req, res) => {
//   try {
//     const transactionId = uuidv4(); // or "TXN" + Date.now();
//     const amount = 100; // ₹1 in paise
//     const mobileNumber = "8526190332";

//     // Optional: Pull these from req.body if needed
//     const vendorId = "67f39b84c961825d0d036535";

//     const redirectUrl = `https://api.nithyaevent.com/api/payment/status/${MERCHANT_ID}/${transactionId}/${vendorId}/${amount}`;

//     const payloadObj = {
//       merchantId: MERCHANT_ID,
//       merchantTransactionId: transactionId,
//       merchantUserId: "MUID_" + Date.now(),
//       amount,
//       redirectUrl,
//       redirectMode: "POST",
//       mobileNumber,
//       paymentInstrument: {
//         type: "PAY_PAGE",
//       },
//     };

//     const payload = JSON.stringify(payloadObj);
//     const base64Payload = Buffer.from(payload).toString("base64");

//     const stringToSign = base64Payload + "/pg/v1/pay" + SALT_KEY;
//     const xVerify =
//       CryptoJS.SHA256(stringToSign).toString() + "###" + SALT_INDEX;

//     const response = await axios.post(
//       `${PHONEPE_BASE_URL}/pg/v1/pay`,
//       { request: base64Payload },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "X-VERIFY": xVerify,
//           "X-MERCHANT-ID": MERCHANT_ID,
//         },
//       }
//     );

//     const redirectUrlFromPhonePe =
//       response.data?.data?.instrumentResponse?.redirectInfo?.url;

//     if (!redirectUrlFromPhonePe) {
//       throw new Error("Redirect URL not found in PhonePe response");
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Payment initiated successfully",
//       paymentUrl: redirectUrlFromPhonePe,
//       merchantTransactionId: transactionId,
//     });
//   } catch (error) {
//     console.error(
//       "PhonePe Payment Error:",
//       error?.response?.data || error.message
//     );
//     return res.status(500).json({
//       success: false,
//       message: "Payment initiation failed",
//       error: error?.response?.data || error.message,
//     });
//   }
// };

// exports.checkTransactionStatus = async (req, res) => {
//   const { merchantId, merchantTransactionId, userId } = req.params;
//   const saltKey = "ecd74096-c2ad-4989-bcca-69a1c9d8deec";
//   const url = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
//   const xVerify =
//     crypto
//       .createHash("sha256")
//       .update(url + saltKey)
//       .digest("hex") +
//     "###" +
//     1;

//   try {
//     const response = await axios.get(
//       `https://api.phonepe.com/apis/hermes${url}`,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "X-VERIFY": xVerify,
//           " X-MERCHANT-ID": "M22E0HWMLLIYY",
//         },
//       }
//     );

//     response.data.data.paymentInstrument = JSON.stringify(
//       response.data.data.paymentInstrument
//     );

//     // Save the responseData to MongoDB
//     if (response.data.code === "PAYMENT_SUCCESS") {
//       const responseData = new paymentGatewayModal({
//         userId: userId,
//         code: response.data.code,

//         data: response.data.data,
//         message: response.data.message,
//         success: response.data.success,
//       });
//       await responseData.save();
//     }

//     return res.status(200).json({
//       success: true,
//       responseData: response.data,
//     });
//   } catch (error) {
//     console.error("Error checking transaction status:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to check transaction status.",
//     });
//   }
// };

const axios = require("axios");
const sha256 = require("sha256");
const paymentGatewayModal = require("../../models/payment/Payment");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

class Paymentgetway {
  async initiatePayment(req, res) {
    const transactionId = uuidv4();
    console.log("id", transactionId);

    try {
      const base64 = Buffer.from(
        JSON.stringify({
          merchantId: process.env.PHONEPE_MERCHANT_ID,
          merchantTransactionId: transactionId,
          merchantUserId: req.body.userId,
          amount: req.body.amount,
          redirectUrl: "",
          redirectMode: "POST",
          callbackUrl: `https://api.nithyaevent.com/api/payment/status/M22E0HWMLLIYY/${transactionId}`,
          mobileNumber: req.body.mobileNumber,
          paymentInstrument: {
            type: "PAY_PAGE",
          },
        })
      ).toString("base64");
      console.log("base64===", base64);

      const sha256encode =
        sha256(base64 + "/pg/v1/payecd74096-c2ad-4989-bcca-69a1c9d8deec") +
        "###1";
      console.log("sha256encode===", sha256encode);

      return res.status(200).json({
        success: true,
        message: "Payment initiated successfully",
        base64: base64,
        sha256encode: sha256encode,
        merchantId: "M22E0HWMLLIYY",
        merchantTransactionId: transactionId,
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      res.status(500).json({
        success: false,
        message: "Payment initiation failed. Please try again.",
      });
    }
  }

  async checkTransactionStatus(req, res) {
    const { merchantId, merchantTransactionId, userId } = req.params;
    const saltKey = "ecd74096-c2ad-4989-bcca-69a1c9d8deec";
    const url = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
    const xVerify =
      crypto
        .createHash("sha256")
        .update(url + saltKey)
        .digest("hex") +
      "###" +
      1;

    try {
      const response = await axios.get(
        `https://api.phonepe.com/apis/hermes${url}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerify,
            " X-MERCHANT-ID": "M22E0HWMLLIYY",
          },
        }
      );

      response.data.data.paymentInstrument = JSON.stringify(
        response.data.data.paymentInstrument
      );

      // Save the responseData to MongoDB
      if (response.data.code === "PAYMENT_SUCCESS") {
        const responseData = new paymentGatewayModal({
          userId: userId,
          code: response.data.code,

          data: response.data.data,
          message: response.data.message,
          success: response.data.success,
        });
        await responseData.save();
      }

      return res.status(200).json({
        success: true,
        responseData: response.data,
      });
    } catch (error) {
      console.error("Error checking transaction status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check transaction status.",
      });
    }
  }

  async getpaymentstatusByUserId(req, res) {
    let userId = req.params.userId;
    try {
      const status = await paymentGatewayModal.find({
        userId,
      });

      if (status) {
        return res.json({ getPaymentStatus: status });
      } else {
        return res.json({ getPaymentStatus: [] });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to fetch user status" });
    }
  }
  async getAllPayment(req, res) {
    try {
      const payment = await paymentGatewayModal.find({});
      if (payment) {
        res.status(200).json({ success: payment });
      } else {
        res.status(404).json({ error: "something went wrong" });
      }
    } catch (error) {
      console.log("error:", error);
    }
  }
}

const paymentgetwaycontroller = new Paymentgetway();
module.exports = paymentgetwaycontroller;
