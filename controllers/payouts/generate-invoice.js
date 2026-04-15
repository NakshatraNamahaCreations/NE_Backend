const GenerateInvoiceSchema = require("../../models/payouts/generate-invoice");

exports.generateInvoice = async (req, res) => {
  try {
    const {
      items,
      invoice_number,
      event,
      subtotal,
      commission_applied,
      tax_applied,
      amount_to_paid,
      amount_in_words,
      generated_date,
      vendor,
    } = req.body;

    const newInvoice = new GenerateInvoiceSchema({
      items,
      invoice_number,
      subtotal,
      event,
      commission_applied,
      tax_applied,
      amount_to_paid,
      amount_in_words,
      generated_date,
      vendor,
      invoice_status: "Generated",
    });

    await newInvoice.save();
    // console.log("Invoice Created:", newInvoice);
    res.status(200).json({ message: "Invoice Generated", product: newInvoice });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllInvoice = async (req, res) => {
  try {
    const invoices = await GenerateInvoiceSchema.find()
      .populate("vendor")
      .populate("event")
      .sort({ _id: -1 });

    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ message: "Invoices not found" });
    }
    return res.status(200).json(invoices);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getStatusById = async (req, res) => {
  try {
    const { event, vendor } = req.query;

    const invoice = await GenerateInvoiceSchema.findOne({
      event,
      vendor,
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json({
      message: "Invoice status fetched successfully",
      status: invoice.invoice_status,
      created_date: invoice.generated_date,
    });
  } catch (error) {
    console.error("Error fetching invoice status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
