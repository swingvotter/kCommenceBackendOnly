const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  street: String,
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: { type: String, required: [true, "email is required from bc"] },
    password: {
      type: String,
      required: [true, "password is required from bc"],
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    address: { type: String, default: undefined },
  },
  { timestamps: true }
);

const user = mongoose.model("user", userSchema);

module.exports = user;
