const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  orderItems: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
      name: { type: String },
      price: { type: Number },
      quantity: { type: Number },
    },
  ],
  totalAmount: { type: Number },
  totalItems: { type: Number },
  paymentStatus: {
    type: String,
    enum: ["paid", "pending", "cancelled"],
    default: "pending",
  },
  paymentReference: { type: String },
});

const order = mongoose.model("order", orderSchema);
module.exports = order;
