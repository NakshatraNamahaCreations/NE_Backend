const express = require("express");
const router = express.Router();
const {
  getVendorNotificationByVendorId,
  markNotificationAsRead,
} = require("../../controllers/notifications/vendor-inapp");

router.get("/get-notifications", getVendorNotificationByVendorId);
router.put("/mark-read/:notificationId", markNotificationAsRead);

module.exports = router;
