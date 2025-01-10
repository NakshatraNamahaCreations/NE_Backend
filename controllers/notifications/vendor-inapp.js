const notificationSchema = require("../../models/notifications/vendor-inapp");

exports.getVendorNotificationByVendorId = async (req, res) => {
  try {
    const { vendorId } = req.query;

    // Validate vendorId
    if (!vendorId) {
      return res.status(400).json({ message: "Vendor ID is required" });
    }

    // Query notifications for the given vendor ID, sorted by creation date
    const notifications = await notificationSchema
      .find({ vendor_id: vendorId })
      .sort({ created_at: -1 });

    // Return the notifications
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params; // Get notification ID from URL params

    // Find the notification by its ID
    const notification = await notificationSchema.findOne({
      _id: notificationId,
    });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Update the status to 'read'
    notification.status = "read";
    await notification.save();

    // Send the updated notification as a response
    res.status(200).json({
      message: "Notification marked as read successfully",
      notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};
