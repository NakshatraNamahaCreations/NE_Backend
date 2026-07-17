// VENDOR INVOICE — the vendor billing the marketplace for one order.
// Layout follows the client-supplied "Vendor Side" format.
const {
  getCompany,
  toBuffer,
  money,
  round2,
  amountInWords,
  makeQr,
  fetchImage,
  fmtDate,
} = require("./common");

const LINE = { color: "#999999" };

/**
 * Commission/GST math.
 *
 * Verified against the client's example: subtotal 200 @ 20% commission gives
 * 200-40 = 160 taxable, 160*18% = 28.80 GST, net 188.80 — exactly their figure.
 * (Their sheet labels it "22%" but the arithmetic is 20%, so the RATE comes
 * from the vendor's own record rather than the example.)
 */
exports.computeVendorTotals = (items, commissionPct, taxPct) => {
  const subtotal = round2(
    items.reduce((sum, it) => sum + (Number(it.total) || 0), 0)
  );
  const commission = round2((subtotal * commissionPct) / 100);
  const taxable = round2(subtotal - commission);
  // GST splits evenly into SGST + CGST/UGST (9% + 9% for an 18% rate).
  const halfRate = taxPct / 2;
  const sgst = round2((taxable * halfRate) / 100);
  const cgst = round2((taxable * halfRate) / 100);
  const totalGst = round2(sgst + cgst);
  const netPayable = round2(taxable + totalGst);
  return {
    subtotal,
    commission,
    commissionPct,
    taxable,
    sgst,
    cgst,
    halfRate,
    totalGst,
    netPayable,
  };
};

const labelRow = (label, value) => [
  { text: label, bold: true, margin: [0, 1, 0, 1] },
  { text: value || "", margin: [0, 1, 0, 1] },
];

exports.buildVendorInvoice = async ({ order, vendor, items, invoiceNumber }) => {
  const company = await getCompany();
  const commissionPct = Number(vendor.commission_percentage) || 0;
  const taxPct = Number(vendor.commission_tax) || 0;
  const t = exports.computeVendorTotals(items, commissionPct, taxPct);

  // Load every image up front; each is optional and null-safe.
  const [qr, vendorLogo, companyLogo, vendorSign] = await Promise.all([
    makeQr(order.order_id),
    fetchImage(vendor.vendor_image || vendor.shop_image),
    fetchImage(company.logo),
    fetchImage(vendor.signature_image),
  ]);

  const vendorName =
    vendor.vendor_name || vendor.business_name || vendor.shop_name || "";

  const content = [
    {
      columns: [
        { text: "VENDOR INVOICE", style: "title" },
        vendorLogo
          ? { image: "vendorLogo", width: 70, alignment: "right" }
          : { text: "", alignment: "right" },
      ],
    },
    { text: " ", margin: [0, 6] },

    // ---- Invoice / event meta -------------------------------------------
    {
      columns: [
        {
          width: "50%",
          stack: [
            { text: [{ text: "Invoice Number: ", bold: true }, invoiceNumber] },
            { text: [{ text: "Event Name: ", bold: true }, order.event_name || ""] },
            {
              text: [
                { text: "Event End Date: ", bold: true },
                fmtDate(order.event_end_date),
              ],
            },
          ],
        },
        {
          width: "50%",
          stack: [
            {
              text: [
                { text: "Invoice Date: ", bold: true },
                fmtDate(new Date()),
              ],
            },
            {
              text: [
                { text: "Event Start Date: ", bold: true },
                fmtDate(order.event_start_date),
              ],
            },
          ],
        },
      ],
    },
    { canvas: [{ type: "line", x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, ...LINE }] },

    // ---- Billed From (vendor) -------------------------------------------
    { text: "Billed From:", bold: true, margin: [0, 10, 0, 6] },
    {
      layout: "noBorders",
      table: {
        widths: [110, "*"],
        body: [
          labelRow("Name:", vendorName),
          labelRow("Address:", vendor.address || vendor.shop_address || ""),
          labelRow("GSTIN:", vendor.gst_number || ""),
          labelRow(
            "Email / Phone No:",
            [vendor.email, vendor.mobile_number].filter(Boolean).join(" / ")
          ),
          labelRow("Pan Number", vendor.pan_number || ""),
        ],
      },
    },
    { canvas: [{ type: "line", x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, ...LINE }] },

    // ---- Billed To (marketplace) ----------------------------------------
    { text: "Billed to:", bold: true, margin: [0, 10, 0, 6] },
    {
      layout: "noBorders",
      table: {
        widths: [110, "*"],
        body: [
          labelRow("Name:", company.name),
          labelRow("Address:", company.address),
          labelRow("GSTIN:", company.gstin),
          labelRow("Phone No:", company.phone),
          labelRow("Email", company.email),
        ],
      },
    },
    { canvas: [{ type: "line", x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, ...LINE }] },

    // ---- Bank details ----------------------------------------------------
    { text: "Bank Details:", bold: true, margin: [0, 10, 0, 6] },
    {
      table: {
        widths: [180, "*"],
        body: [
          [{ text: "Account Holder Name", bold: true }, vendor.account_holder_name || ""],
          [{ text: "Bank Name", bold: true }, vendor.bank_name || ""],
          [{ text: "Account Number", bold: true }, vendor.account_number || ""],
          [{ text: "IFSC Code", bold: true }, vendor.ifsc_code || ""],
        ],
      },
    },

    // ---- Items -----------------------------------------------------------
    { text: "Product Details:", bold: true, pageBreak: "before", margin: [0, 0, 0, 6] },
    {
      table: {
        headerRows: 1,
        widths: ["*", 70, 70, 80],
        body: [
          [
            { text: "Description", style: "th" },
            { text: "Price", style: "th" },
            { text: "Quantity", style: "th" },
            { text: "Total", style: "th" },
          ],
          ...items.map((it) => [
            it.description,
            money(it.price),
            String(it.quantity),
            money(it.total),
          ]),
        ],
      },
    },

    // ---- Totals ----------------------------------------------------------
    {
      margin: [0, 14, 0, 0],
      columns: [
        { width: "*", text: "" },
        {
          width: 260,
          table: {
            widths: ["*", 90],
            body: [
              [{ text: "Sub Total", bold: true }, { text: money(t.subtotal), bold: true }],
              [
                { text: `Commission (${t.commissionPct}%)`, bold: true },
                { text: money(t.commission), bold: true },
              ],
              [{ text: `SGST (${t.halfRate}%)`, bold: true }, { text: money(t.sgst), bold: true }],
              [
                { text: `CGST / UGST (${t.halfRate}%)`, bold: true },
                { text: money(t.cgst), bold: true },
              ],
              [{ text: "Total GST", bold: true }, { text: money(t.totalGst), bold: true }],
              [
                { text: "NET TOTAL PAYABLE:", bold: true },
                { text: money(t.netPayable), bold: true },
              ],
            ],
          },
        },
      ],
    },
    {
      text: amountInWords(t.netPayable),
      bold: true,
      fontSize: 11,
      margin: [0, 14, 0, 14],
    },

    // ---- Signature / QR --------------------------------------------------
    {
      columns: [
        {
          width: "*",
          stack: [
            { text: "For", bold: true, fontSize: 11 },
            { text: vendorName, bold: true, fontSize: 11, margin: [0, 4, 0, 4] },
            { text: "Authorized Signatory.", bold: true, fontSize: 8 },
            vendorSign
              ? { image: "vendorSign", width: 110, margin: [0, 4, 0, 0] }
              : {
                  margin: [0, 4, 0, 0],
                  table: { widths: [150], body: [[{ text: " \n\n" }]] },
                },
          ],
        },
        qr
          ? { width: 110, image: "qr", width: 90, alignment: "right" }
          : { width: 110, text: "" },
      ],
    },

    { text: "Payment Terms:", bold: true, fontSize: 12, margin: [0, 16, 0, 6] },
    {
      ul: [
        "Payment will be processed within 7 working days.",
        `Commission of ${t.commissionPct}% is deducted as per agreement.`,
        "This is a system-generated invoice and does not require a stamp.",
      ],
    },
    {
      margin: [0, 20, 0, 0],
      columns: [
        {
          stack: [
            { text: "Thank you for partnering with Nithyaevent", bold: true, fontSize: 8 },
            { text: `email: ${company.email}`, bold: true, fontSize: 8, margin: [0, 3, 0, 0] },
          ],
        },
        companyLogo
          ? { image: "companyLogo", width: 60, alignment: "right" }
          : { text: "" },
      ],
    },

    // ---- Terms & Conditions ---------------------------------------------
    { text: "Terms & Conditions", style: "h1", pageBreak: "before", alignment: "center" },
    ...termsAndConditions(company),
  ];

  // Only register images that actually loaded — referencing a missing key
  // makes pdfmake throw and would fail the whole invoice.
  const images = {};
  if (qr) images.qr = qr;
  if (vendorLogo) images.vendorLogo = vendorLogo;
  if (companyLogo) images.companyLogo = companyLogo;
  if (vendorSign) images.vendorSign = vendorSign;

  return toBuffer({
    pageSize: "A4",
    pageMargins: [40, 40, 40, 40],
    images,
    content,
    styles: {
      title: { fontSize: 20, bold: true },
      h1: { fontSize: 16, bold: true, margin: [0, 0, 0, 12] },
      h2: { fontSize: 11, bold: true, margin: [0, 10, 0, 4] },
      th: { bold: true, fillColor: "#FBE4D5" },
    },
  });
};

function termsAndConditions(company) {
  const sections = [
    [
      "1. Payment Terms",
      "Payment will be processed within 7 working days after invoice verification. Payments are made via bank transfer / UPI / NEFT to the vendor's registered account.",
    ],
    [
      "2. Commission Deduction",
      `${company.name} / Nithyaevent will deduct commission from the vendor's total billed amount as per the agreed partnership terms.`,
    ],
    [
      "3. Cancellation Policy",
      "If the event is cancelled by the customer:\n• Cancellations made 2 days prior will be eligible for partial settlement as per policy.\n• Cancellations made within 1 day may result in no payout, depending on the nature of work performed and agreement terms.",
    ],
    [
      "4. Service / Rental Period",
      "• The service or rental period is valid from the event start date and time to the end date and time. Any extension must be approved beforehand and is subject to availability and additional charges if applicable.",
    ],
    [
      "5. Delivery & Pickup Responsibility",
      `• Vendors are responsible for delivering and collecting items/services on time. If ${company.name} / Nithyaevent arranges logistics, additional fees or deductions may apply.`,
    ],
    [
      "6. Condition of Items / Service Quality",
      "Vendors must ensure:\n• Equipment is in good working condition\n• Services are delivered professionally and on schedule\nAny damage or quality issues may lead to deductions or rejection of invoice.",
    ],
    [
      "7. Liability",
      `Vendors are responsible for their equipment, staff, and services during the event. ${company.name} / Nithyaevent is not liable for operational or handling damages caused by the vendor.`,
    ],
    [
      "8. Indemnification",
      `The vendor agrees to indemnify and hold ${company.name} / Nithyaevent harmless from any losses, damages, or claims arising out of the vendor's equipment or services.`,
    ],
    ["9. Governing Law", "This agreement is governed by the laws of Bengaluru, Karnataka."],
    [
      "10. Modification of Terms",
      `${company.name} / Nithyaevent reserves the right to update these terms at any time. Vendors will be notified of any significant changes.`,
    ],
    [
      "11. Contact Information",
      `For any invoice or payment-related queries, please contact: ${company.email}`,
    ],
  ];
  const out = [];
  sections.forEach(([heading, body]) => {
    out.push({ text: heading, style: "h2" });
    out.push({ text: body, margin: [0, 0, 0, 4] });
  });
  out.push({
    text: "This is a system-generated invoice and does not require a signature",
    bold: true,
    alignment: "center",
    margin: [0, 18, 0, 0],
  });
  return out;
}
