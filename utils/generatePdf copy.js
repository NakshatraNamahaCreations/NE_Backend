
const puppeteer = require('puppeteer');
const express = require('express');
const moment = require('moment');
const router = express.Router();
const fs = require('fs');

router.post('/generate-delivery-challan', (req, res, next) => {
  res.set('Content-Encoding', 'identity');
  next();
}, async (req, res) => {

  try {
    const { event, productData } = req.body;
    const validProductData = (productData || []).map(item => ({
      ...item,
      // ⚠️ Critical: If imageUrl is relative, prefix it with your base URL
      imageUrl: item.imageUrl?.startsWith('http')
        ? item.imageUrl
        : "",
    }));

    function escapeHtml(unsafe) {
      if (typeof unsafe !== 'string') return '';
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    const html = `<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Delivery Challan</title>
  <style>
    /* Your styles here */
    body {
      font-family: "Montserrat", sans-serif;
      margin: 0;
      padding: 0;
      background-color: white;
      color: #333;
      box-sizing: border-box;
    }
    .container { padding: 15px; }
    .header { text-align: center; font-size: 22px; font-weight: bold; margin: 10px 0; }
    .event-date { display: flex; justify-content: center; gap: 10px; color: gray; font-size: 14px; margin-bottom: 15px; }
    .details-section .row { display: grid; grid-template-columns: 150px auto; align-items: center; margin-bottom: 10px; }
    .details-section .row span { font-size: 14px; color: #333; }
    .details-section .label { font-weight: bold; white-space: nowrap; }
    .details-section .value { overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; }
    .items-table { margin-top: 20px; width: 100%; border-collapse: collapse; background-color: #fff; }
    .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
    .items-table th { background-color: #f4f4f4; font-weight: bold; }
    .items-table td img { max-width: 50px; height: auto; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">${escapeHtml(event.event_name || 'Event Name')}</div>
    <div class="event-date">
      <span>${moment(event.event_start_date, 'DD-MM-YYYY').format('ll') || 'Start Date'
      }</span>
      <span>${event.event_start_time || 'Start Time'}</span>
    </div>
    <div class="details-section">
      <!-- Event details -->
      <div class="row"><span class="label">Booked by:</span><span class="value">${escapeHtml(event.user_name || 'N/A')
      }</span></div>
      <div class="row"><span class="label">Receiver:</span><span class="value">${escapeHtml(event.receiver_name || 'N/A')
      }, +91 ${escapeHtml(event.receiver_mobilenumber || 'N/A')}</span></div>
      <div class="row"><span class="label">Event Timing:</span><span class="value">${event.event_start_time || 'N/A'
      } - ${event.event_end_time || 'N/A'}</span></div>
      <div class="row"><span class="label">Event Date:</span><span class="value">From ${event.event_start_date
      } To ${event.event_end_date}</span></div>
      <div class="row"><span class="label">Venue Name:</span><span class="value">${escapeHtml(event.venue_name || 'N/A')
      }</span></div>
      <div class="row"><span class="label">Location:</span><span class="value">${escapeHtml(event.event_location || 'N/A')
      }</span></div>
    </div>
    <table class="items-table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Description</th>
          <th>Qty</th>
        </tr>
      </thead>
      <tbody>
         ${validProductData.length > 0
        ? validProductData
          .map(
            ele => `
              <tr>
                <td><img src="${escapeHtml(ele.imageUrl)}" alt="Product" /></td>
                <td>${escapeHtml(ele.productName || 'N/A')}</td>
                <td>${ele.quantity || 0}</td>
              </tr>`,
          )
          .join('')
        : `<tr><td colspan="3" style="text-align: center;">No Products Available</td></tr>`
      }
      </tbody>
    </table>
  </div>
</body>
</html>`
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    // ⚠️ Wait for network + images
    await page.setContent(html, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
    });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10px', bottom: '10px', left: '10px', right: '10px' },
    });

    await browser.close();

    // Optional: Save for debugging
    // fs.writeFileSync('test_server.pdf', pdfBuffer);

    const base64Pdf = pdfBuffer.toString('base64');

    // Debug: Ensure it starts with valid PDF signature in Base64
    // PDF magic number: "%PDF" → Base64 starts with "JVBERi"
    console.log('Base64 starts with:', base64Pdf.substring(0, 10));
    // Should log: JVBERi0xLj...

    console.log('Raw buffer (first 4 bytes):', pdfBuffer.subarray(0, 4));

    res.json({
      success: true,
      fileName: 'Delivery_Challan.pdf',
      base64: base64Pdf,
    });
  } catch (err) {
    console.error('Challan generation error:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

module.exports = router;