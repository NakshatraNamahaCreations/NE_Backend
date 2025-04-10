const crypto = require("crypto");
const axios = require("axios");

exports.initiatePayment = async (req, res) => {
  try {
    const merchantTransactionId = req.body.transactionId;
    const data = {
      merchantId: "M22E0HWMLLIYY",
      merchantTransactionId: merchantTransactionId,
      merchantUserId: req.body.MUID,
      name: req.body.name,
      amount: req.body.amount * 100, // Convert amount to paise
      redirectUrl: `https://api.nithyaevent.com/api/status/${merchantTransactionId}`,
      redirectMode: "POST",
      mobileNumber: req.body.number,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");
    const keyIndex = 1;
    const string =
      payloadMain + "/pg/v1/pay" + "ecd74096-c2ad-4989-bcca-69a1c9d8deec";
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
    const options = {
      method: "POST",
      url: prod_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    const response = await axios.request(options);
    console.log(response.data);

    // Return the redirect URL to the frontend
    res.status(200).json({
      success: true,
      paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
    });
  } catch (error) {
    console.error("Error in newPayment:", error.message);
    res.status(500).send({
      message: "Failed to initiate payment",
      success: false,
    });
  }
};

exports.checkStatus = async (req, res) => {
  const merchantTransactionId = res.req.body.transactionId;
  const merchantId = res.req.body.merchantId;

  const keyIndex = 1;
  const string =
    `/pg/v1/status/${merchantId}/${merchantTransactionId}` +
    "ecd74096-c2ad-4989-bcca-69a1c9d8deec";
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const options = {
    method: "GET",
    url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": `${merchantId}`,
    },
  };

  axios
    .request(options)
    .then(async (response) => {
      if (response.data.success === true) {
        const url = `http://localhost:3000/success`;
        return res.redirect(url);
      } else {
        const url = `http://localhost:3000/failure`;
        return res.redirect(url);
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = {
  newPayment,
  checkStatus,
};
