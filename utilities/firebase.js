// Firebase Admin — used to send push notifications (FCM) to the apps.
// Initialises from a service-account JSON key. If the key isn't present yet
// (e.g. not configured on a machine), push is disabled gracefully instead of
// crashing the server.
const fs = require("fs");
const path = require("path");

let admin = null;
let initialized = false;

// Load the service account from (in order): a full JSON env var, three separate
// env vars, or a local JSON file. Env vars are preferred for cloud deploys.
function loadServiceAccount() {
  // 1) Entire service-account JSON in one env var.
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      if (parsed.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
      }
      return parsed;
    } catch (e) {
      console.error("FIREBASE_SERVICE_ACCOUNT is not valid JSON:", e.message);
    }
  }
  // 2) The three required fields as separate env vars.
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      // .env stores newlines as literal "\n"; convert them back.
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  }
  // 3) A JSON file on disk (local dev).
  const keyPath =
    process.env.FIREBASE_KEY_PATH ||
    path.join(process.cwd(), "firebase-service-account.json");
  if (fs.existsSync(keyPath)) return require(keyPath);
  return null;
}

try {
  // Require inside try so a missing package never crashes the server — push is
  // simply disabled until firebase-admin is installed + the key is present.
  admin = require("firebase-admin");
  const serviceAccount = loadServiceAccount();

  if (serviceAccount) {
    admin.initializeApp({ credential: admin.cert(serviceAccount) });
    initialized = true;
    console.log("✅ Firebase Admin initialized (push enabled)");
  } else {
    console.warn(
      "⚠️ Firebase credentials not found — push notifications disabled. " +
        "Set FIREBASE_SERVICE_ACCOUNT (or FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY) in .env."
    );
  }
} catch (err) {
  console.error("Firebase Admin init error:", err.message);
}

/**
 * Send a push notification to one or more device tokens. Best-effort — never
 * throws, so callers (e.g. order creation) are never broken by push failures.
 *
 * @param {string|string[]} tokens - FCM device token(s).
 * @param {object} opts - { title, body, data, sound, channelId }
 */
exports.sendPush = async (
  tokens,
  { title, body, data = {}, sound = "default", channelId = "orders" } = {}
) => {
  if (!initialized) return { success: false, reason: "not-initialized" };

  const list = (Array.isArray(tokens) ? tokens : [tokens]).filter(Boolean);
  if (!list.length) return { success: false, reason: "no-tokens" };

  // FCM data values must all be strings.
  const stringData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, String(v)])
  );

  try {
    const res = await admin.messaging().sendEachForMulticast({
      tokens: list,
      notification: { title, body },
      data: stringData,
      android: {
        priority: "high",
        notification: {
          sound, // "default" or a bundled raw sound name
          channelId, // must match the app's notifee channel
          notificationPriority: "PRIORITY_MAX", // heads-up pop
          defaultVibrateTimings: true,
        },
      },
      apns: {
        headers: { "apns-priority": "10" },
        payload: { aps: { sound } },
      },
    });

    // Log per-token failures (e.g. stale/unregistered tokens) to aid debugging.
    if (res.failureCount > 0) {
      res.responses.forEach((r, i) => {
        if (!r.success) {
          console.warn(
            `Push failed for token ${list[i]?.slice(0, 12)}…:`,
            r.error?.code,
            r.error?.message
          );
        }
      });
    }
    console.log(
      `Push sent: ${res.successCount} ok, ${res.failureCount} failed`
    );
    return { success: true, successCount: res.successCount, res };
  } catch (err) {
    console.error("sendPush error:", err.message);
    return { success: false, error: err.message };
  }
};

exports.isPushEnabled = () => initialized;
