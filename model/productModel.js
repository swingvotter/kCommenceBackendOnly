const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    quantity: Number,
    category: { type: String, enum: ["headset", "laptop", "watch", "console"] },
    image: [{ url: { type: String }, public_Id: { type: String } }],
  },
  { timestamps: true }
);

const product = mongoose.model("product", productSchema);

module.exports = product;
