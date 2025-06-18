const GenerateInvoiceSchema = require("../../models/payouts/generate-invoice");

exports.generateInvoice = async (req, res) => {
  try {
    const {
      items,
      invoice_number,
      subtotal,
      commission_applied,
      tax_applied,
      amount_to_paid,
      generate_date,
      vendor,
    } = req.body;

    const newInvoice = new GenerateInvoiceSchema({
      items,
      invoice_number,
      subtotal,
      commission_applied,
      tax_applied,
      amount_to_paid,
      generate_date,
      vendor,
      invoice_status: "Generated",
    });

    await newInvoice.save();
    console.log("Invoice Created:", newInvoice);
    res.status(200).json({ message: "Invoice Generated", product: newInvoice });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
