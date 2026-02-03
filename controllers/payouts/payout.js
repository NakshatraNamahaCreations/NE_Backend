const payoutSchema = require("../../models/payouts/payout");
const notificationSchema = require("../../models/notifications/vendor-inapp");
const sendPushNotification = require("../../utils/sendPushNotification")
const vendorAuthSchema = require("../../models/vendor/vendor")


exports.addPayout = async (req, res) => {
  try {
    const {
      seller_name,
      store,
      seller_id,
      ordered_date,
      event_name,
      event_id,
      created_date,
      updated_by,
      commission_percentage,
      commission_amount,
      tax_percentage,
      tax_amount,
      payout_amount,
      remark,
      processed_date,
      transaction_Id,
      failure_remark,
    } = req.body;

    const newPayout = new payoutSchema({
      store,
      seller_id,
      ordered_date,
      event_name,
      event_id,
      payout_status: "Initialized",
      created_date,
      updated_by,
      commission_percentage,
      commission_amount,
      tax_percentage,
      tax_amount,
      payout_amount,
      seller_name,
      remark,
      processed_date,
      transaction_Id,
      failure_remark,
    });
    await newPayout.save();
    await notificationSchema.create({
      vendor_id: seller_id,
      notification_type: "vendor_payment",
      message: `Your payment of "Rs.${payout_amount}/-" for event ${event_name} is being Initiated.`,
      status: "unread",
      metadata: { event_id }, // Add additional metadata if needed
      created_at: new Date(),
    });
    const title = "Payment Initiated";
    const bodyContent = `Your payment of Rs.${payout_amount}/- for event ${event_name} is being Initiated.`;
    const vendor = await vendorAuthSchema
      .findById(seller_id)
      .select("fcmToken");

    if (vendor?.fcmToken) {
      await sendPushNotification(vendor.fcmToken, title, bodyContent);
    }
    res.status(200).json({
      message: "Initialized",
      data: newPayout,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.confirmPayoutProcessed = async (req, res) => {
  try {
    const payout_id = req.params.id;
    const findPayout = await payoutSchema.findOne({ _id: payout_id });
    if (!findPayout) {
      return res.status(404).json({ message: "Payout not found" });
    }
    const {
      created_date,
      updated_by,
      remark,
      processed_date,
      transaction_Id,
      failure_remark,
      payout_amount,
      event_name,
      seller_id,
    } = req.body;

    findPayout.payout_status = "Processed";
    findPayout.created_date = created_date || findPayout.created_date;
    findPayout.updated_by = updated_by || findPayout.updated_by;
    findPayout.remark = remark || findPayout.remark;
    findPayout.processed_date = processed_date || findPayout.processed_date;
    findPayout.transaction_Id = transaction_Id || findPayout.transaction_Id;
    findPayout.failure_remark = failure_remark || findPayout.failure_remark;

    await findPayout.save();
    res.status(200).json({
      message: "Payout processed successfully",
      data: findPayout,
    });

    await notificationSchema.create({
      vendor_id: seller_id,
      notification_type: "vendor_payment",
      message: `Your payment of "Rs.${payout_amount}/-" for event ${event_name} is being processed.`,
      status: "unread",
      metadata: { event_name }, // Add additional metadata if needed
      created_at: new Date(),
    });
    const title = "Payment processed";
    const bodyContent = `Your payment of Rs.${payout_amount}/- for event ${event_name} is being processed.`;
    const vendor = await vendorAuthSchema
      .findById(seller_id)
      .select("fcmToken");

    if (vendor?.fcmToken) {
      await sendPushNotification(vendor.fcmToken, title, bodyContent);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllPayouts = async (req, res) => {
  try {
    const payout = await payoutSchema.find().sort({ _id: -1 });
    if (payout.length === 0) {
      return res.status(404).json({ message: "payout list not found" });
    } else {
      return res.status(200).json({ data: payout });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPayoutsByIds = async (req, res) => {
  try {
    const payout = await payoutSchema
      .find({ seller_id: req.params.id })
      .sort({ _id: -1 });
    if (!payout) {
      return res.status(404).json({ message: "payout not found" });
    } else {
      const processedAmount = payout
        .filter((item) => item.payout_status === "Processed")
        .reduce((acc, curr) => acc + curr.payout_amount, 0);

      const initiatedAmount = payout
        .filter((item) => item.payout_status === "Initialized")
        .reduce((acc, curr) => acc + curr.payout_amount, 0);

      return res.status(200).json({
        data: payout,
        processedAmount: processedAmount,
        initiatedAmount: initiatedAmount,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPayoutAmountsByVendorID = async (req, res) => {
  try {
    const payout = await payoutSchema.find({ seller_id: req.params.id });
    if (payout.length === 0) {
      // console.log("payout not found");
      return res.status(404).json({ message: "Payout not found" });
    }
    const totalPayout = payout
      .filter((item) => item.payout_status === "Processed")
      .reduce((acc, curr) => acc + curr.payout_amount, 0);
    // console.log("totalPayout", totalPayout);
    return res.status(200).json({ data: parseFloat(totalPayout.toFixed(2)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.changeTicketStatus = async (req, res) => {
  try {
    const { ticket_status } = req.body;
    let ticketId = req.params.id;
    let findTicket = await payoutSchema.findOne({ _id: ticketId });
    if (!findTicket) {
      // console.log("ticket not found");
      return res.status(404).json({ message: "ticket not found" });
    }
    findTicket.ticket_status = ticket_status;
    await findTicket.save();
    res.status(200).json({
      message: "Status Changed",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
