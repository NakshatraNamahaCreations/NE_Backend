const axios = require("axios");

const CUSTOMER_ID = process.env.CUSTOMER_ID;
const CALL_FLOW_ID = process.env.CALL_FLOW_ID;
const CALLER_ID = process.env.CALLER_ID;
const INITIATE_CALL_URL =
  "https://iqtelephony.airtel.in/gateway/airtel-xchange/v2/execute/workflow";
const HEADER_AUTH = process.env.HEADER_AUTH;
const HEADER_AUTH_VALUE = `Basic ${HEADER_AUTH}`;

exports.initiateCall = async (vendorNumber) => {
  try {
    let data = JSON.stringify({
      callFlowId: CALL_FLOW_ID,
      customerId: CUSTOMER_ID,
      callType: "OUTBOUND",
      callFlowConfiguration: {
        client_add_participant: {
          participants: [
            {
              participantName: "Vendor",
              participantAddress: "8973267337",
              callerId: CALLER_ID,
              maxRetries: 1,
              audioId: 0,
              maxTime: 0,
              enableEarlyMedia: "false",
            },
          ],
          mergingStrategy: "SEQUENTIAL",
          maxTime: 0,
        },
      },
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: INITIATE_CALL_URL,
      headers: {
        Authorization: HEADER_AUTH_VALUE,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    console.log("Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return { success: false, data: error.response?.data || error.message };
  }
};
