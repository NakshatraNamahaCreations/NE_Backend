const axios = require("axios");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || 1;
const PHONEPE_BASE = "https://api.phonepe.com/apis/hermes";   // production
// For sandbox use: https://api-preprod.phonepe.com/apis/pg-sandbox

// ✅ Helper: SHA256 hash
const sha256 = (data) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

// -----------------------------------------------------
// ✅ 1. INITIATE PAYMENT FOR WEB
// -----------------------------------------------------
exports.newPayment = async (req, res) => {
  try {
    // ✅ auto-generate transaction id (same as mobile)
    const merchantTransactionId = uuidv4();

    // PhonePe redirects (POST) the customer back here after payment. This must
    // be a publicly reachable backend URL that matches the web-status route
    // (`/api/payment/web-status/:txn`) — a localhost URL breaks completion.
    const SERVER_BASE =
      process.env.SERVER_BASE_URL || "https://api.nithyaevent.com";

    const data = {
      merchantId: "M22E0HWMLLIYY",
      merchantTransactionId: merchantTransactionId,
      merchantUserId: req.body.MUID,
      name: req.body.name,
      amount: req.body.amount * 100,
      redirectUrl: `${SERVER_BASE}/api/payment/web-status/${merchantTransactionId}`,
      redirectMode: "POST",
      mobileNumber: req.body.number,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    const payload = JSON.stringify(data);
    const base64Payload = Buffer.from(payload).toString("base64");

    const saltKey = "ecd74096-c2ad-4989-bcca-69a1c9d8deec";
    const saltIndex = 1;

    const stringToHash =
      base64Payload + "/pg/v1/pay" + saltKey;

    const sha256Hash = crypto
      .createHash("sha256")
      .update(stringToHash)
      .digest("hex");

    const xVerify = sha256Hash + "###" + saltIndex;

    const response = await axios.post(
      "https://api.phonepe.com/apis/hermes/pg/v1/pay",
      { request: base64Payload },
      { headers: { "Content-Type": "application/json", "X-VERIFY": xVerify } }
    );

    return res.status(200).json({
      success: true,
      paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
      merchantTransactionId,
    });

  } catch (error) {
    console.error("Error newPayment:", error);
    res.status(500).json({ success: false, message: "Payment failed" });
  }
};


// -----------------------------------------------------
// ✅ 2. CHECK STATUS (WEB REDIRECT HANDLER)
// -----------------------------------------------------
exports.checkStatus = async (req, res) => {
  try {
    const merchantTransactionId = req.params.txn;
    const merchantId = MERCHANT_ID;

    const path = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
    const hash = sha256(path + SALT_KEY);
    const checksum = `${hash}###${SALT_INDEX}`;

    const options = {
      method: "GET",
      url: `${PHONEPE_BASE}${path}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": merchantId,
      },
    };

    const response = await axios.request(options);

    // ✅ If payment success redirect FE
    if (response.data.code === "PAYMENT_SUCCESS") {
      return res.redirect(
        `${process.env.CLIENT_SUCCESS_URL}?txn=${merchantTransactionId}&status=success`
      );
    }

    // ❌ Failure
    return res.redirect(
      `${process.env.CLIENT_SUCCESS_URL}?txn=${merchantTransactionId}&status=failed`
    );
  } catch (error) {
    console.error("checkStatus error:", error.response?.data || error.message);
    return res.redirect(
      `${process.env.CLIENT_SUCCESS_URL}?status=error`
    );
  }
};
