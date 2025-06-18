const mongoose = require("mongoose");

const GenerateInvoiceSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    items: Array,
    invoice_number: String,
    subtotal: String,
    commission_applied: String,
    tax_applied: String,
    amount_to_paid: String,
    generate_date: String,
    invoice_status: String,
  },
  {
    timestamps: true,
  }
);

const invoice = mongoose.model("GenerateInvoice", GenerateInvoiceSchema);

module.exports = invoice;
