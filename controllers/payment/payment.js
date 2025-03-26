const crypto = require("crypto");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const paymentGatewayModal = require("../../models/payment/Payment");

exports.initiatePayment = async (req, res) => {
  const transactionId = uuidv4();

  try {
    const base64 = Buffer.from(
      JSON.stringify({
        merchantId: process.env.PHONEPE_MERCHANT_ID,
        merchantTransactionId: transactionId,
        merchantUserId: req.body.MUID,
        amount: 100,
        redirectUrl: "",
        redirectMode: "POST",
        callbackUrl: `https://api.nithyaevent.com/api/payment/status/M22E0HWMLLIYY/${transactionId}`,
        mobileNumber: "8951592630",
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
};

exports.checkTransactionStatus = async (req, res) => {
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
};
