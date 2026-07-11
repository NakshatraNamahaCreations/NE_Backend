// Firebase Admin — used to send push notifications (FCM) to the apps.
// Initialises from a service-account JSON key. If the key isn't present yet
// (e.g. not configured on a machine), push is disabled gracefully instead of
// crashing the server.
const fs = require("fs");
const path = require("path");

let admin = null;
let initialized = false;

try {
  // Require inside try so a missing package never crashes the server — push is
  // simply disabled until firebase-admin is installed + the key is present.
  admin = require("firebase-admin");
  const keyPath =
    process.env.FIREBASE_KEY_PATH ||
    path.join(process.cwd(), "firebase-service-account.json");

  if (fs.existsSync(keyPath)) {
    const serviceAccount = require(keyPath);
    admin.initializeApp({ credential: admin.cert(serviceAccount) });
    initialized = true;
    console.log("✅ Firebase Admin initialized (push enabled)");
  } else {
    console.warn(
      "⚠️ Firebase service account not found — push notifications disabled. " +
        "Place firebase-service-account.json in the backend root or set FIREBASE_KEY_PATH."
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
        notification: { sound, channelId, defaultSound: true },
      },
      apns: { payload: { aps: { sound } } },
    });
    return { success: true, successCount: res.successCount, res };
  } catch (err) {
    console.error("sendPush error:", err.message);
    return { success: false, error: err.message };
  }
};

exports.isPushEnabled = () => initialized;
