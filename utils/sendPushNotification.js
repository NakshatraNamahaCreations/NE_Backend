const admin = require("../config/firebaseConfig");

const sendPushNotification = async (fcmToken, title, body) => {
    const message = {
        notification: {
            title: title,
            body: body,
        },
        // Essential for Android foreground behavior
        android: {
            priority: "high",
            notification: {
                sound: "default",
                channelId: "default_channel_id", // Must match your app side channel
            },
        },
        token: fcmToken,
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("Successfully sent message:", response);
    } catch (error) {
        console.error("Error sending message:", error);
    }
};

module.exports = sendPushNotification;