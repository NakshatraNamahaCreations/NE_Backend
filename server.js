const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const bodyParser = require("body-parser");
const Buffer = require("buffer").Buffer;

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected........."))
  .catch((err) => console.log("Database Not Connected!!!", err));

const userauthRoutes = require("./routes/user/users");
const vendorauthRoutes = require("./routes/vendor/vendor");
const product = require("./routes/vendor/product");
const order = require("./routes/vendor/order");
const team = require("./routes/team/team");
const service = require("./routes/service/service");
const subService = require("./routes/service/sub-service");
// user
const userorder = require("./routes/user/Order");

const { default: axios } = require("axios");
// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" })); // support json encoded bodies
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use("/public", express.static("public"));

// Routes
app.use("/api/user", userauthRoutes);
app.use("/api/vendor", vendorauthRoutes);
app.use("/api/product", product);
app.use("/api/order", order);
app.use("/api/team", team);
app.use("/api/service", service);
app.use("/api/sub-service", subService);
// user
app.use("/api/user-order", userorder);

// app.use("/api/users", require("./routes/users"));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.get("/", (req, res) => {
  res.send("Hey, Jimmy!...This is Event Box backend 🐶🤗");
});

async function initiateCall() {
  const airtelUrl =
    "https://8f10-2404-ba00-fd01-ebeb-f893-2495-9197-cd19.ngrok-free.app/v2/execute/workflow"; // Replace with actual Airtel API endpoint

  // Base64 encoding username and password for Basic Auth
  const username = "ff906156_c935_48e5_835a_5472dbf2af6b"; // Replace with actual Airtel username
  const password = "OiisEVk47E"; // Replace with actual Airtel password
  const authToken = Buffer.from(`${username}:${password}`).toString("base64");

  const headers = {
    Authorization: `Basic ${authToken}`,
    "Content-Type": "application/json",
  };

  const data = {
    callFlowId: "9b71-4dcb-8ed1-e9a5a5fe5c15", // Replace with actual callFlowId
    customerId: "87178372-9b71-4dcb-8ed1-e9a5a5fe5c15", // Replace with actual customerId
    callType: "OUTBOUND",
    callFlowConfiguration: {
      initiateCall_1: {
        mergingStrategy: "SEQUENTIAL",
        participants: [
          {
            participantAddress: ["9164566466"], // Replace with actual phone number
            callerId: "8526190332", // Replace with your caller ID
            participantName: "A",
            maxRetries: 1,
            maxTime: 0,
          },
        ],
        maxTime: 0,
        callBackURLs: [
          {
            eventType: "CALL",
            notifyURL: `${process.env.NGROK_URL}/call-events`,
            method: "POST",
            headers: {},
          },
          {
            eventType: "CALL",
            notifyURL: `${process.env.NGROK_URL}/call-events`,
            method: "POST",
            headers: {},
          },
        ],
      },
      addParticipant_1: {
        mergingStrategy: "SEQUENTIAL",
        maxTime: 0,
        participants: [
          {
            participantAddress: ["9164566466"], // Replace with your phone number
            callerId: "8526190332", // Replace with your caller ID
            participantName: "B",
            maxRetries: 1,
            maxTime: 0,
            enableEarlyMedia: true,
          },
        ],
      },
      record: {
        enabled: true,
      },
    },
  };

  try {
    const response = await axios.post(airtelUrl, data, { headers });
    console.log("Call initiated successfully:", response.data);
  } catch (error) {
    console.error(
      "Error initiating call:",
      error.response ? error.response.data : error.message
    );
  }
}

// Endpoint to trigger the call
app.post("/v2/execute/workflow", async (req, res) => {
  try {
    await initiateCall();
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: "Error initiating call" });
  }
});

// Endpoint to handle call events
app.post("/call-events", (req, res) => {
  const event = req.body;
  console.log("Received event:", JSON.stringify(event, null, 2));
  console.log("Received call event:", event);

  // Handle the event, e.g., log it, store it in a database, etc.

  res.sendStatus(200); // Send acknowledgment back to the API
});

// app.post("/initiate-call", async (req, res) => {
//   const { caller, receiver } = req.body; // Get caller and receiver from the request body

//   try {
//     const response = await axios.post(
//       "https://airtel-api-url/call-initiation",
//       {
//         caller: caller,
//         receiver: receiver,
//         callbackUrl:
//           "https://8f10-2404-ba00-fd01-ebeb-f893-2495-9197-cd19.ngrok-free.app/call-events", // Replace with your actual ngrok URL
//       }
//     );

//     console.log("Call initiation response:", response.data);
//     res.status(200).send("Call initiated successfully");
//   } catch (error) {
//     console.error(
//       "Error initiating call:",
//       error.response ? error.response.data : error.message
//     );
//     res.status(500).send("Error initiating call");
//   }
// });

const PORT = process.env.PORT || 9000;
app.listen(PORT, () =>
  console.log(`Server running on port at http://localhost:${PORT}`)
);
