// airtelWorkflow.js
const axios = require("axios");
const express = require("express");
const app = express();

app.use(express.json());

// ==== ENV (set via .env) ====
const AIRTEL_BASE_URL =
  process.env.AIRTEL_BASE_URL ||
  "https://iqtelephony.airtel.in/gateway/airtel-xchange";
const AIRTEL_CLIENT_ID = process.env.AIRTEL_CLIENT_ID || "<your-client-id>";
const AIRTEL_SECRET = process.env.AIRTEL_SECRET || "<your-client-secret>";
const WORKFLOW_ID = process.env.WORKFLOW_ID || "<your-workflow-id>";
const CUSTOMER_ID = process.env.CUSTOMER_ID || "<your-customer-id>";
const CLI = process.env.CLI || "<approved-cli>";
const CALLBACK_URL =
  process.env.CALLBACK_URL || "https://your-public-domain.com/call-events";

const AUTH_HEADER =
  "Basic " +
  Buffer.from(`${AIRTEL_CLIENT_ID}:${AIRTEL_SECRET}`).toString("base64");

// helper: format numbers to 91XXXXXXXXXX
const normalizeMsisdn = (num) => {
  const s = String(num).replace(/[^\d]/g, "");
  if (s.startsWith("91")) return s;
  if (s.startsWith("0")) return "91" + s.slice(1);
  return "91" + s;
};

// IMPORTANT: replace 'initiateCall_1' with your actual node name from the Airtel portal
const FIRST_NODE_KEY = process.env.WORKFLOW_FIRST_NODE || "initiateCall_1";

async function initiateCall(toNumber) {
  const url = `${AIRTEL_BASE_URL}/v2/execute/workflow`;

  const body = {
    workflowId: WORKFLOW_ID,
    customerId: CUSTOMER_ID,
    requestId: `req_${Date.now()}`, // unique per request
    workflowConfiguration: {
      [FIRST_NODE_KEY]: {
        mergingStrategy: "SEQUENTIAL",
        participants: [
          {
            participantAddress: normalizeMsisdn(toNumber),
            callerId: CLI,
            participantName: "Vendor",
            maxRetries: 1,
            maxTime: 0,
            enableEarlyMedia: false,
          },
        ],
        maxTime: 0,
        // Optional callback; remove if you don't have a public endpoint yet
        callBackURLs: [
          {
            eventType: "CALL",
            notifyURL: CALLBACK_URL,
            method: "POST",
            headers: {},
          },
        ],
      },
    },
  };

  const res = await axios.post(url, body, {
    headers: {
      Authorization: AUTH_HEADER,
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });

  return res.data;
}

// Example API route to trigger a call
app.post("/internal/initiate-airtel-workflow", async (req, res) => {
  try {
    const { to } = req.body; // expects { "to": "9876543210" }
    if (!to) return res.status(400).json({ message: "Missing 'to' number" });
    const out = await initiateCall(to);
    res.status(200).json(out);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { message: err.message });
  }
});

// Webhook receiver (the endpoint you put in notifyURL)
app.post("/call-events", (req, res) => {
  console.log("Airtel callback:", JSON.stringify(req.body, null, 2));
  // TODO: verify authenticity (if headers/signature provided), then persist
  res.sendStatus(200);
});

// module.exports = { app, initiateCall };
// or start a server if you want to run directly:
// app.listen(9000, () => console.log("Server on 9000"));
