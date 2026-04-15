// utils/pdfUtils.js
import moment from 'moment';
import NumberToWord from '../component/order/NumberToWord'; // Import or define NumberToWord function

export const generateHtmlContent = (
  order,
  vendorData,
  invoiceNumber,
  sellerAddress,
  taxes,
  finalAmountWithIncludingTax,
) => {
  return `
    <html>
    <head>
      <style>
        body { font-family: 'Montserrat', sans-serif; }
        .header { text-align: center; font-size: 20px; font-weight: bold; margin-top: 20px; }
        .section { margin: 20px; }
        .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .col { flex: 1; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { border: 1px solid black; padding: 8px; text-align: left; }
        .table th { background-color: #cacaca; }
        .total { text-align: right; margin-top: 20px; font-weight: bold; }
        .footer { margin-top: 20px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">EVENT BOX</div>
      <div class="section">
        <div class="row">
          <div class="col">Order ID: ${order.order_id}</div>
          <div class="col">Order Date: ${moment(order.ordered_date).format(
            'DD-MM-YYYY',
          )}</div>
        </div>
        <div class="row">
          <div class="col">Invoice ID: EB-${invoiceNumber.toUpperCase()}</div>
          <div class="col">Invoice Date: ${moment(order.ordered_date).format(
            'DD-MM-YYYY',
          )}</div>
        </div>
        <div class="row">
          <div class="col">
            <strong>Sold By:</strong><br>
            ${order.store_or_seller.toUpperCase()}<br>
            ${sellerAddress.address[0]?.houseFlatBlock}, ${
    sellerAddress.address[0]?.roadArea
  }<br>
            ${sellerAddress.address[0]?.cityDownVillage}, ${
    sellerAddress.address[0]?.distric
  }, ${sellerAddress.address[0]?.state} - ${
    sellerAddress.address[0]?.pincode
  }<br>
            GST: ${sellerAddress?.gst_number}
          </div>
          <div class="col">
            <strong>Billing Address:</strong><br>
            ${vendorData.address[0]?.fullName}<br>
            ${vendorData.address[0]?.houseFlatBlock}, ${
    vendorData.address[0]?.roadArea
  }<br>
            ${vendorData.address[0]?.cityDownVillage}, ${
    vendorData.address[0]?.distric
  }, ${vendorData.address[0]?.state} - ${vendorData.address[0]?.pincode}
          </div>
        </div>
        <div class="row">
          <div class="col">
            <strong>Shipping Address:</strong><br>
            ${vendorData.address[0]?.fullName}<br>
            ${vendorData.address[0]?.houseFlatBlock}, ${
    vendorData.address[0]?.roadArea
  }<br>
            ${vendorData.address[0]?.cityDownVillage}, ${
    vendorData.address[0]?.distric
  }, ${vendorData.address[0]?.state} - ${vendorData.address[0]?.pincode}
          </div>
        </div>
      </div>
      <div class="section">
        <table class="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Tax</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${order.product_name}</td>
              <td>${order.applied_quantity}</td>
              <td>${order.product_price}</td>
              <td>CGST (9%): ${taxes.cgst.toFixed(
                2,
              )}<br>SGST (9%): ${taxes.sgst.toFixed(2)}</td>
              <td>${finalAmountWithIncludingTax.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <div class="total">
          TOTAL: ${finalAmountWithIncludingTax.toFixed(2)}<br>
          All values are in INR
        </div>
        <div>
          <strong>Amount in Words:</strong><br>
          ${NumberToWord(finalAmountWithIncludingTax.toFixed(2))}
        </div>
      </div>
      <div class="footer">
        Declaration: The goods sold are intended for end user consumption and not for resale.
      </div>
    </body>
    </html>
  `;
};
