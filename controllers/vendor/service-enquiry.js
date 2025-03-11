const notificationSchema = require("../../models/notifications/vendor-inapp");
const enquirySchema = require("../../models/vendor/service-enquiry");

exports.postEnquiry = async (req, res) => {
  try {
    const {
      service_id,
      service_name,
      room_name,
      room_id,
      vendor_id,
      user_name,
      user_id,
      booking_date,
      adult_qty,
      children_qty,
    } = req.body;

    const newEnquiry = new enquirySchema({
      service_id,
      service_name,
      room_name,
      room_id,
      vendor_id,
      user_name,
      user_id,
      booking_date,
      adult_qty,
      children_qty,
    });
    const vendorNotification = {
      vendor_id: vendor_id,
      notification_type: "enquiry",
      message: `${user_name}" has been enquired your ${room_name}`,
      product_id: service_id,
      metadata: { user_id },
      status: "unread",
      created_at: new Date(),
    };
    await notificationSchema.create(vendorNotification);
    await newEnquiry.save();
    console.log("Enquiry response:", newEnquiry);
    return res
      .status(200)
      .json({ message: "Form submitted", data: newEnquiry });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
