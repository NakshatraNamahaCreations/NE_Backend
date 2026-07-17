// USER TAX INVOICE — what the customer receives for an order.
// Layout follows the client-supplied "User Side" format.
//
// IMPORTANT: the amounts come from the values already stored on the order
// (base_amount / tds_deduction / amount_after_deduction / gst_applied_value /
// paid_amount), which is the calculation the platform has always used and the
// customer actually paid. The client's sample sheet is a LAYOUT spec — its
// example figures are internally inconsistent (its "taxable" is the line total
// divided by 1.05, i.e. a 5% rate, while the columns say 9%+9%), so they are not
// used as a formula.
const {
  getCompany,
  toBuffer,
  money,
  num,
  round2,
  amountInWords,
  makeQr,
  fetchImage,
  fmtDate,
} = require("./common");

// Split an order into invoice lines, allocating the order-level TDS/GST across
// items in proportion to each line's gross value so the lines always re-add to
// the stored totals.
exports.buildLines = (order) => {
  const days = Number(order.number_of_days) || 1;
  const raw = [
    ...(order.product_data || []).map((i) => ({ ...i, kind: "Product" })),
    ...(order.service_data || []).map((i) => ({ ...i, kind: "Service" })),
    ...(order.tech_data || []).map((i) => ({ ...i, kind: "Technician" })),
  ];

  const lines = raw.map((it) => {
    const qty = Number(it.quantity) || 1;
    const price = Number(it.productPrice) || 0;
    const mrp = Number(it.mrpPrice) || 0;
    const gross = round2(price * qty * days);
    return {
      kind: it.kind,
      name: it.productName || it.name || "",
      dimension: it.productDimension || "",
      sellerName: it.sellerName || "",
      sellerId: it.sellerId || "",
      qty,
      price,
      days,
      // MRP above the charged price is shown as the discount.
      discount: mrp > price ? round2((mrp - price) * qty * days) : 0,
      grossBeforeDiscount: round2((mrp > price ? mrp : price) * qty * days),
      gross,
      eventStartDate: it.eventStartDate || order.event_start_date,
      eventEndDate: it.eventEndDate || order.event_end_date,
    };
  });

  const base = round2(
    Number(order.base_amount) || lines.reduce((s, l) => s + l.gross, 0)
  );
  const totalTds = round2(Number(order.tds_deduction) || 0);
  const totalGst = round2(Number(order.gst_applied_value) || 0);

  // Proportional allocation; the final line absorbs rounding drift so the
  // column sums equal the stored order totals exactly.
  let tdsLeft = totalTds;
  let gstLeft = totalGst;
  lines.forEach((l, idx) => {
    const last = idx === lines.length - 1;
    const share = base > 0 ? l.gross / base : 0;
    l.tds = last ? round2(tdsLeft) : round2(totalTds * share);
    tdsLeft = round2(tdsLeft - l.tds);
    l.taxable = round2(l.gross - l.tds);
    const lineGst = last ? round2(gstLeft) : round2(totalGst * share);
    gstLeft = round2(gstLeft - lineGst);
    // Intra-state: GST splits into CGST + SGST. IGST stays 0.
    l.cgst = round2(lineGst / 2);
    l.sgst = round2(lineGst - l.cgst);
    l.igst = 0;
    l.total = round2(l.taxable + l.cgst + l.sgst + l.igst);
  });

  const totals = {
    grossBeforeDiscount: round2(
      lines.reduce((s, l) => s + l.grossBeforeDiscount, 0)
    ),
    discount: round2(lines.reduce((s, l) => s + l.discount, 0)),
    other: 0,
    taxable: round2(lines.reduce((s, l) => s + l.taxable, 0)),
    cgst: round2(lines.reduce((s, l) => s + l.cgst, 0)),
    sgst: round2(lines.reduce((s, l) => s + l.sgst, 0)),
    igst: 0,
    tds: round2(lines.reduce((s, l) => s + l.tds, 0)),
    total: round2(lines.reduce((s, l) => s + l.total, 0)),
  };
  return { lines, totals, base };
};

const meta = (label, value) => ({
  text: [{ text: `${label} `, bold: true }, String(value ?? "")],
  margin: [0, 1, 0, 1],
});

exports.buildUserInvoice = async ({ order, invoiceNumber }) => {
  const company = await getCompany();
  const { lines, totals } = exports.buildLines(order);
  const [qr, companyLogo] = await Promise.all([
    makeQr(order.order_id),
    fetchImage(company.logo),
  ]);

  const tdsPct = company.tdsPercentage;
  const customer = [
    order.receiver_name || order.user_name,
    order.venue_name,
    order.event_location,
    order.receiver_mobilenumber || order.user_mobile_number,
    order.user_mailid,
  ]
    .filter(Boolean)
    .join("\n");

  // Vendors supplying this order — shown as "Ship From".
  const sellers = [...new Set(lines.map((l) => l.sellerName).filter(Boolean))];

  const th = (t, align) => ({ text: t, bold: true, fontSize: 7, alignment: align || "right" });
  const td = (t, align) => ({ text: t, fontSize: 7, alignment: align || "right" });

  const itemRows = [];
  lines.forEach((l) => {
    // Description block, then the numeric row — mirrors the client's layout.
    itemRows.push([
      {
        colSpan: 10,
        stack: [
          { text: `${l.name}${l.dimension ? ` - ${l.dimension}` : ""}`, bold: true, fontSize: 8 },
          {
            text: `${l.kind} - Rental Service (Not for Sale)`,
            bold: true,
            fontSize: 7,
          },
          {
            text: `Rental Period: ${fmtDate(l.eventStartDate)} to ${fmtDate(l.eventEndDate)}`,
            fontSize: 7,
          },
          { text: `Duration: ${l.days} Day(s)`, fontSize: 7 },
          { text: "Condition: Item must be returned undamaged", fontSize: 7 },
          {
            text: `SAC: ${company.sac || "-"}  |  9% CGST, 9% SGST/UGST, ${tdsPct}% TDS`,
            fontSize: 7,
            bold: true,
          },
          ...(l.sellerName
            ? [{ text: `Supplied by: ${l.sellerName}`, fontSize: 7, italics: true }]
            : []),
        ],
        margin: [0, 3, 0, 3],
      },
      {}, {}, {}, {}, {}, {}, {}, {}, {},
    ]);
    itemRows.push([
      td(String(l.qty), "center"),
      td(money(l.grossBeforeDiscount)),
      td(money(l.discount)),
      td(money(0)),
      td(money(l.taxable)),
      td(money(l.cgst)),
      td(money(l.sgst)),
      td(l.igst ? money(l.igst) : "-"),
      td(l.tds ? money(l.tds) : "-"),
      td(money(l.total)),
    ]);
  });

  const content = [
    {
      columns: [
        { text: "Tax Invoice", style: "title" },
        companyLogo ? { image: "companyLogo", width: 55, alignment: "right" } : { text: "" },
      ],
    },
    { text: " ", margin: [0, 4] },

    {
      columns: [
        {
          width: "60%",
          stack: [
            meta("Invoice Number:", invoiceNumber),
            meta("Order Number:", order.order_id),
            meta("Nature of Transaction:", "Intra-State"),
            meta("Place of Supply:", "KARNATAKA"),
          ],
        },
        {
          width: "40%",
          stack: [
            meta("Invoice Date:", fmtDate(new Date())),
            meta("Order Date:", fmtDate(order.ordered_date || order.createdAt)),
            meta("Nature of Supply:", "Service"),
          ],
        },
      ],
    },
    { canvas: [{ type: "line", x1: 0, y1: 6, x2: 515, y2: 6, lineWidth: 1, color: "#999" }] },

    {
      margin: [0, 10, 0, 0],
      columns: [
        {
          width: "50%",
          stack: [
            { text: "Bill to / Ship to:", bold: true, margin: [0, 0, 0, 3] },
            { text: customer, fontSize: 8 },
          ],
        },
        {
          width: "50%",
          stack: [
            { text: "Bill From:", bold: true, margin: [0, 0, 0, 3] },
            { text: company.name, fontSize: 8, bold: true },
            { text: company.address, fontSize: 8 },
            {
              text: `Ship From: ${sellers.join(", ") || company.name}`,
              fontSize: 8,
              bold: true,
              margin: [0, 4, 0, 0],
            },
          ],
        },
      ],
    },
    {
      text: [{ text: "GSTIN Number: ", bold: true }, company.gstin || "-"],
      margin: [0, 8, 0, 6],
    },

    {
      table: {
        headerRows: 1,
        widths: [18, "*", 40, 32, 44, 36, 40, 26, 30, 46],
        body: [
          [
            th("Qty", "center"),
            th("Gross Amount"),
            th("Discount"),
            th("Other Charges"),
            th("Taxable Amount"),
            th("CGST"),
            th("SGST/ UGST"),
            th("IGST"),
            th("TDS"),
            th("Total Amount"),
          ],
          ...itemRows,
          [
            { text: "TOTAL", bold: true, fontSize: 7 },
            td(money(totals.grossBeforeDiscount)),
            td(money(totals.discount)),
            td(money(totals.other)),
            td(money(totals.taxable)),
            td(money(totals.cgst)),
            td(money(totals.sgst)),
            td(totals.igst ? money(totals.igst) : "-"),
            td(totals.tds ? money(totals.tds) : "-"),
            { text: money(totals.total), bold: true, fontSize: 7, alignment: "right" },
          ].map((c) => ({ ...c, bold: true })),
        ],
      },
    },
    {
      text: amountInWords(totals.total),
      bold: true,
      fontSize: 9,
      margin: [0, 10, 0, 10],
    },

    {
      columns: [
        {
          width: "*",
          stack: [
            { text: company.name, bold: true, fontSize: 9 },
            { text: "Authorized Signatory", fontSize: 8, margin: [0, 16, 0, 0] },
            { text: "DECLARATION", bold: true, fontSize: 8, margin: [0, 10, 0, 2] },
            {
              text:
                "We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.",
              fontSize: 7,
            },
            {
              text: `Reg Address: ${company.address}`,
              bold: true,
              fontSize: 7,
              margin: [0, 6, 0, 0],
            },
            ...(company.cin
              ? [{ text: `CIN No. ${company.cin}`, fontSize: 7, margin: [0, 2, 0, 0] }]
              : []),
          ],
        },
        qr
          ? {
              width: 80,
              stack: [
                { image: "qr", width: 70 },
                { text: "Purchase made on", fontSize: 6, alignment: "center", margin: [0, 2, 0, 0] },
                {
                  text: fmtDate(order.ordered_date || order.createdAt),
                  fontSize: 6,
                  alignment: "center",
                },
              ],
            }
          : { width: 80, text: "" },
      ],
    },
    {
      text: `If you have any questions, feel free to call customer care at +91 ${company.phone} or use Contact Us section in our App, or log on to ${company.website}/contactus`,
      fontSize: 6.5,
      margin: [0, 14, 0, 0],
    },

    { text: "Terms & Conditions", style: "h1", pageBreak: "before", alignment: "center" },
    ...termsAndConditions(company),
  ];

  const images = {};
  if (qr) images.qr = qr;
  if (companyLogo) images.companyLogo = companyLogo;

  return toBuffer({
    pageSize: "A4",
    pageMargins: [30, 30, 30, 30],
    images,
    content,
    styles: {
      title: { fontSize: 18, bold: true },
      h1: { fontSize: 15, bold: true, margin: [0, 0, 0, 10] },
      h2: { fontSize: 10, bold: true, margin: [0, 8, 0, 3] },
    },
  });
};

function termsAndConditions(company) {
  const sections = [
    [
      "1. Payment Terms",
      "Payment is due as per the booking confirmation. Accepted payment methods include UPI, bank transfer, debit/credit card. Full payment must be completed before equipment is released or service is delivered.",
    ],
    [
      "2. Reservation & Advance Payment",
      "A 100% advance payment is required to confirm the booking. No equipment or service will be reserved without advance payment.",
    ],
    [
      "3. Cancellation Policy",
      "• Cancellations made at least 2 days before the event will qualify for partial refund as per company policy.\n• Cancellations made within 24 hours of the event will not be eligible for any refund.\n• No-show bookings are considered fully chargeable.",
    ],
    [
      "4. Rental / Service Period",
      "The rental/service period will be from the event start date and time to the end date and time. Any extension must be requested in advance and may incur additional charges.",
    ],
    [
      "5. Delivery, Setup & Pickup",
      "• Delivery and pickup are provided at an additional cost, depending on distance and accessibility.\n• The customer must ensure the venue is accessible for delivery, setup, and pickup of items.\n• Any delays caused by customer-side issues may incur extra charges.",
    ],
    [
      "6. Condition of Rented Equipment",
      "• All rented items are tested and delivered in good working condition.\n• Customers are responsible for proper use and safekeeping of items during the rental period.\n• Any damage, loss, or malfunction caused by the customer will result in repair or replacement charges.",
    ],
    [
      "7. Liability",
      `Nithyaevent / ${company.name} is not responsible for:\n• Any injury, accident, or damage caused by misuse of equipment\n• Issues arising from improper venue conditions (power, space, flooring, weather, etc.)\nThe customer assumes full responsibility for the rented equipment during the rental period.`,
    ],
    [
      "8. Indemnification",
      `Customers agree to indemnify and hold Nithyaevent / ${company.name} harmless against any claims, losses, or damages arising from the use of rented items or services.`,
    ],
    ["9. Governing Law", "All transactions and agreements are governed by the laws of Bengaluru, Karnataka."],
    [
      "10. Modification of Terms",
      `Nithyaevent / ${company.name} may update these terms at any time. Customers will be notified of any major changes.`,
    ],
    ["11. Contact Information", `For support or queries, please contact: ${company.email}`],
  ];
  const out = [];
  sections.forEach(([heading, body]) => {
    out.push({ text: heading, style: "h2" });
    out.push({ text: body, fontSize: 8, margin: [0, 0, 0, 3] });
  });
  out.push({
    text: "This invoice/receipt is system-generated and does not require a physical signature.",
    alignment: "center",
    fontSize: 8,
    margin: [0, 14, 0, 0],
  });
  return out;
}
