const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    user_id: String,
    user_name: String,
    user_email: String,
    ticket_reason: String,
    ticket_command: String,
    product_id: String,
    product_name: String,
    attachment_file: String,
    ticket_created_date: String,
    ticket_status: String,
    vendor_name: String,
    vendor_id: String,
    update_date: String,
    remark: String,
  },
  {
    timestamps: true,
  }
);

const ticket = mongoose.model("ticket", ticketSchema);

module.exports = ticket;
