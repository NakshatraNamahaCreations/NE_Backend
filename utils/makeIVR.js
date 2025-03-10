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
        initiateCall_1: {
          callerId: CALLER_ID,
          mergingStrategy: "MERGE",
          participants: [
            {
              participantAddress: vendorNumber,
              callerId: CALLER_ID,
              participantName: "Kiruthika",
              maxRetries: 1,
              maxTime: 0,
            },
          ],
          maxTime: 0,
        },
        addParticipant_1: {
          mergingStrategy: "MERGE",
          // mergingStrategy: "SEQUENTIAL",
          maxTime: 0,
          participants: [
            {
              participantAddress: "9943740866",
              participantName: "suman",
              maxRetries: 1,
              maxTime: 0,
              enableEarlyMedia: true,
            },
          ],
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
    // console.log(JSON.stringify(response.data));
    console.log(JSON.stringify(data, null, 2));
    return { success: true, data: response.data };
  } catch (error) {
    console.log(error);
    console.log(
      "Error on Initiating call:",
      error.response ? error.response.data : error.errorMessage
    );
  }
};
