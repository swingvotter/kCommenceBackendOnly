const Order = require("../model/orderModel");
const Cart = require("../model/cartModel");
const User = require("../model/userModel");
const axios = require("axios");
const crypto = require("crypto");

// PLACE ORDER CONTROLLER
const placeOrder = async (req, res) => {
  try {
    // Find cart and populate product details
    const cart = await Cart.findOne({ userId: req.userInfo.id }).populate(
      "items.productId"
    );
    console.log("Found cart:", cart);

    // Check if cart exists and has items
    if (!cart) {
      return res.status(400).json({
        success: false,
        message: "No cart found for this user",
      });
    }

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty... add items to cart first",
      });
    }

    // Map cart items to order items
    const orderItems = cart.items.map((item) => ({
      name: item.productId.name,
      price: item.productId.price,
      quantity: item.quantity,
      productId: item.productId._id,
    }));

    // Calculate totals
    const totalAmount = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const totalItems = orderItems.reduce((acc, item) => acc + item.quantity, 0);

    console.log("Order details:", { orderItems, totalAmount, totalItems });

    // Find and verify user
    const user = await User.findById(req.userInfo.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    try {
      // Initialize Paystack transaction
      const paystackPayload = {
        currency: "GHS",
        amount: Math.round(totalAmount * 100), // Convert to lowest currency unit
        email: user.email,
        callback_url: `${process.env.CLIENT_URL}`,
      };
      console.log("Paystack payload:", paystackPayload);

      const paystackRes = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        paystackPayload,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Paystack response:", paystackRes.data);

      if (
        !paystackRes.data ||
        !paystackRes.data.data ||
        !paystackRes.data.data.authorization_url
      ) {
        throw new Error("Invalid response from payment provider");
      }

      const reference = paystackRes.data.data.reference;

      // Create order
      const order = await Order.create({
        userId: req.userInfo.id,
        orderItems,
        totalAmount,
        totalItems,
        paymentReference: reference,
      });

      console.log("Created order:", order);

      // Clear the user's cart after successful order creation
      await Cart.findOneAndDelete({ userId: req.userInfo.id });
      console.log("Cart cleared for user:", req.userInfo.id);

      return res.status(200).json({
        success: true,
        message: "Order created. Proceed to payment.",
        order,
        paymentUrl: paystackRes.data.data.authorization_url,
      });
    } catch (paymentError) {
      console.error("Payment initialization error:", paymentError);
      return res.status(500).json({
        success: false,
        message: "Failed to initialize payment: " + paymentError.message,
      });
    }
  } catch (error) {
    console.error("Order error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

// PAYSTACK WEBHOOK HANDLER
const webhook = async (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== signature) {
      return res.status(401).send("Invalid signature");
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const ref = event.data.reference;

      const order = await Order.findOne({ paymentReference: ref });
      if (!order) {
        console.error("No order found with reference:", ref);
        return res.sendStatus(404);
      }

      if (order.paymentStatus === "paid") {
        return res.sendStatus(200); // already processed
      }

      order.paymentStatus = "paid";
      await order.save();

      console.log(`✅ Payment confirmed for order ${order._id}`);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { placeOrder, webhook };
