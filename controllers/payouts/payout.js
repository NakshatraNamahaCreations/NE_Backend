const payoutSchema = require("../../models/payouts/payout");

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllPayouts = async (req, res) => {
  try {
    const payout = await payoutSchema.find();
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
    const payout = await payoutSchema.find({ seller_id: req.params.id });
    if (!payout) {
      return res.status(404).json({ message: "payout not found" });
    } else {
      return res.status(200).json({ data: payout });
    }
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
      console.log("ticket not found");
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
