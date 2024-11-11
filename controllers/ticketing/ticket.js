const ticketSchema = require("../../models/ticketing/ticket");

exports.createTicket = async (req, res) => {
  try {
    const {
      user_id,
      user_name,
      user_email,
      ticket_reason,
      ticket_command,
      product_id,
      product_name,
      ticket_created_date,
    } = req.body;

    const attachmentFile = `public/ticket/${req.file.filename}`;

    const newTicket = new ticketSchema({
      user_id: user_id,
      user_name: user_name,
      user_email: user_email,
      ticket_reason: ticket_reason,
      ticket_command: ticket_command,
      product_id: product_id,
      product_name: product_name,
      attachment_file: attachmentFile,
      ticket_created_date: ticket_created_date,
      ticket_status: "Created",
    });
    await newTicket.save();

    res.status(200).json({
      message: "Ticket Created",
      data: newTicket,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const ticket = await ticketSchema.find();
    if (ticket.length === 0) {
      return res.status(404).json({ message: "ticket list not found" });
    } else {
      return res.status(200).json({ data: ticket });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await ticketSchema.find({ user_id: req.params.id });
    if (!ticket) {
      return res.status(404).json({ message: "ticket not found" });
    } else {
      return res.status(200).json({ data: ticket });
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
    let findTicket = await ticketSchema.findOne({ _id: ticketId });
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
