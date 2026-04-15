const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema.Types;
const paymentmodal = new Schema({
  userId: {
    type: ObjectId,
  },
  success: Boolean,
  code: String,
  message: String,
  data: {
    merchantId: String,
    merchantTransactionId: String,
    transactionId: String,
    amount: Number,
    state: String,
    responseCode: String,
    paymentInstrument: {
      type: String,
      pgTransactionId: String,
      pgServiceTransactionId: String,
      bankTransactionId: String,
      bankId: String,
    },
  },
  base64: String,
  sha256encode: String,

  createdAt: {
    type: Date,
    default: Date.now(),
  },
  cardNumber: { type: String },
  expiryDate: { type: String },
  cvv: { type: String },
});
const Paymentmodal = mongoose.model("payment", paymentmodal);
module.exports = Paymentmodal;
