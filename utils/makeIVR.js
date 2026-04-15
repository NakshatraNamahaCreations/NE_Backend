// utils/makeIVR.js
const axios = require("axios");

const CUSTOMER_ID = process.env.CUSTOMER_ID; // <-- must be set
const WORKFLOW_ID = process.env.CALL_FLOW_ID; // your env already has this (name in code changed for clarity)
const CALLER_ID = process.env.CALLER_ID;
const HEADER_AUTH = process.env.HEADER_AUTH; // base64 of "<clientId>:<secret>"

const EXECUTE_WORKFLOW_URL =
  "https://iqtelephony.airtel.in/gateway/airtel-xchange/v2/execute/workflow";

if (!CUSTOMER_ID || !WORKFLOW_ID || !CALLER_ID || !HEADER_AUTH) {
  console.warn("[Airtel IVR] Missing envs: ", {
    CUSTOMER_ID: !!CUSTOMER_ID,
    WORKFLOW_ID: !!WORKFLOW_ID,
    CALLER_ID: !!CALLER_ID,
    HEADER_AUTH: !!HEADER_AUTH,
  });
}

const authHeader = `Basic ${HEADER_AUTH}`;

// optional: normalize to E.164 without plus (Airtel usually wants 91XXXXXXXXXX)
const normalizeMsisdn = (num) => {
  const s = String(num).replace(/[^\d]/g, "");
  if (s.startsWith("0")) return `91${s.slice(1)}`;
  if (s.startsWith("91")) return s;
  return `91${s}`;
};

exports.initiateCall = async (vendorNumber) => {
  try {
    const body = {
      // FIELD NAMES THAT AIRTEL EXPECTS:
      workflowId: WORKFLOW_ID,
      customerId: CUSTOMER_ID,
      requestId: `req_${Date.now()}`, // any unique id you want
      workflowConfiguration: {
        // ⚠️ VERY IMPORTANT: this key must match your first node's name in Airtel portal
        // If your node is named something else, change "initiateCall_1" accordingly.
        initiateCall_1: {
          participants: [
            {
              participantName: "Vendor",
              participantAddress: normalizeMsisdn(vendorNumber), // e.g., 9198XXXXXXXX
              callerId: CALLER_ID, // must be a CLI mapped/approved by Airtel
              maxRetries: 1,
              audioId: 0,
              maxTime: 0,
              enableEarlyMedia: false, // boolean, not string
            },
          ],
          mergingStrategy: "SEQUENTIAL",
          maxTime: 0,
        },
      },
    };

    const res = await axios.post(EXECUTE_WORKFLOW_URL, body, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    return { success: true, data: res.data };
  } catch (error) {
    console.log("Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return { success: false, data: error.response?.data || error.message };
  }
};
