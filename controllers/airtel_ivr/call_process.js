const vendorSchema = require("../../models/vendor/vendor");
const { initiateCall } = require("../../utils/makeIVR");

exports.initiateCallUserToVendor = async (req, res) => {
  try {
    const { seller_id } = req.body;
    const findVendor = await vendorSchema.findOne({ _id: seller_id });
    if (!findVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    console.log("findVendor", findVendor.mobile_number);
    const makeCall = await initiateCall(findVendor.mobile_number);
    console.log("makeCall", makeCall);
    if (!makeCall) {
      return res.status(500).json({ message: "Failed to initiated call" });
    }

    return res.json({ message: "Call initiated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
