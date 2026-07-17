// Shared helpers for the generated PDF invoices (user + vendor).
//
// Everything company-specific is read from the Company Profile the admin edits,
// so the GSTIN/address can never drift between platforms again — previously each
// app hardcoded its own (and they disagreed).
const PdfPrinter = require("pdfmake");
const QRCode = require("qrcode");
const companyProfileSchema = require("../../models/master/company_profile");
const payoutConfigSchema = require("../../models/master/payout_config");

// The 14 standard PDF fonts need no font files and no native deps — important
// on a small server. Note they can't render "₹", which is why amounts are
// prefixed "Rs" (matching the client's format).
const FONTS = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

const printer = new PdfPrinter(FONTS);

// Legal entity behind the marketplace. Only used when the admin's Company
// Profile has no value — never to override it.
const FALLBACK_COMPANY = {
  company_name: "Kadagam Ventures Private Limited",
  corporate_address:
    "#34, 1st Floor, Venkatappa Road, Tasker Town, Off Queens Road, Bengaluru - 560051",
  contact_email: "support@nithyaevents.com",
  contact_phone: "9980137001",
};

exports.getCompany = async () => {
  let profile = null;
  try {
    profile = await companyProfileSchema.findOne().lean();
  } catch (e) {
    console.error("invoice: company profile lookup failed:", e.message);
  }
  let payout = null;
  try {
    payout = await payoutConfigSchema.findOne().lean();
  } catch (e) {
    /* GSTIN/SAC fall back below */
  }
  return {
    name: profile?.company_name || FALLBACK_COMPANY.company_name,
    address: profile?.corporate_address || FALLBACK_COMPANY.corporate_address,
    email: profile?.contact_email || FALLBACK_COMPANY.contact_email,
    phone: profile?.contact_phone || FALLBACK_COMPANY.contact_phone,
    logo: profile?.company_logo || null,
    website: profile?.website_url || "www.nithyaevent.com",
    gstin: payout?.company_gst || "",
    sac: payout?.company_saccode || "",
    pan: payout?.company_pan || "",
    cin: payout?.company_cin || "",
    tdsPercentage: Number(payout?.tds_percentage) || 2,
  };
};

// Money — always 2dp. The client's format writes "Rs", not the ₹ glyph.
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
exports.round2 = round2;
exports.money = (n) => `Rs ${round2(n).toFixed(2)}`;
exports.num = (n) => round2(n).toFixed(2);

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty",
  "Ninety",
];

// Indian numbering (crore/lakh), matching the invoice wording style.
function words(n) {
  n = Math.floor(n);
  if (n === 0) return "Zero";
  if (n < 20) return ONES[n];
  if (n < 100) {
    return TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
  }
  if (n < 1000) {
    // No "and" after Hundred — matches the client's wording
    // ("ONE HUNDRED EIGHTY-EIGHT RUPEES AND EIGHTY PAISE ONLY").
    return ONES[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + words(n % 100) : "");
  }
  if (n < 100000) {
    return words(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + words(n % 1000) : "");
  }
  if (n < 10000000) {
    return words(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + words(n % 100000) : "");
  }
  return words(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + words(n % 10000000) : "");
}

// "188.80" -> "ONE HUNDRED EIGHTY-EIGHT RUPEES AND EIGHTY PAISE ONLY"
exports.amountInWords = (amount) => {
  const value = round2(amount);
  const rupees = Math.floor(value);
  const paise = Math.round((value - rupees) * 100);
  let out = `${words(rupees)} Rupees`;
  if (paise > 0) out += ` and ${words(paise)} Paise`;
  return `${out} Only`.toUpperCase();
};

// QR payload — encodes the order so support/vendors can scan to identify it.
exports.makeQr = async (text) => {
  try {
    return await QRCode.toDataURL(String(text || ""), {
      margin: 0,
      width: 220,
    });
  } catch (e) {
    console.error("invoice: QR generation failed:", e.message);
    return null;
  }
};

// pdfmake can't fetch remote URLs — images must be embedded as data URIs. Logos
// live on S3, so pull them down first. Returns null on any failure so a missing
// or broken logo degrades to "no logo" instead of failing the whole invoice.
exports.fetchImage = async (url) => {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = (res.headers.get("content-type") || "").toLowerCase();
    // pdfmake only supports JPEG/PNG.
    if (!/(jpeg|jpg|png)/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const mime = /png/.test(type) ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch (e) {
    console.warn(`invoice: could not load image ${url}: ${e.message}`);
    return null;
  }
};

// Renders a pdfmake document definition to a Buffer.
exports.toBuffer = (docDefinition) =>
  new Promise((resolve, reject) => {
    try {
      const doc = printer.createPdfKitDocument({
        defaultStyle: { font: "Helvetica", fontSize: 9 },
        ...docDefinition,
      });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });

exports.fmtDate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return String(d); // already a display string
  return date.toLocaleDateString("en-GB");
};
