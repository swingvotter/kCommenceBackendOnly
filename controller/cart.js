const Cart = require("../model/cartModel");
const Product = require("../model/productModel");

// Add product to the cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product ID and a valid quantity are required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product with that ID does not exist",
      });
    }

    let cart = await Cart.findOne({ userId: req.userInfo.id });

    if (!cart) {
      // No cart yet → create new one
      const cartItems = [
        { productId: product._id, quantity: parseInt(quantity) },
      ];
      const totalCartAmount = product.price * parseInt(quantity);
      const totalCartItems = parseInt(quantity);

      cart = await Cart.create({
        userId: req.userInfo.id,
        items: cartItems,
        totalAmount: totalCartAmount,
        totalCartItems: totalCartItems,
      });

      return res.status(201).json({
        success: true,
        message: "Successfully added to cart",
        cart,
      });
    }

    // Cart exists → check for existing item
    const existingCartItem = cart.items.find(
      (item) => item.productId.toString() === productId.toString()
    );

    if (existingCartItem) {
      existingCartItem.quantity += parseInt(quantity);
    } else {
      cart.items.push({
        productId: product._id,
        quantity: parseInt(quantity),
      });
    }

    await cart.populate("items.productId");

    cart.totalAmount = cart.items.reduce(
      (acc, item) => acc + item.productId.price * item.quantity,
      0
    );

    cart.totalCartItems = cart.items.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Successfully added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET CART
const getCart = async (req, res) => {
  try {
    // Find cart for the logged-in user and populate product details
    const cart = await Cart.findOne({ userId: req.userInfo.id }).populate("items.productId");

    // If no cart exists, return empty cart
    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: {
          userId: req.userInfo.id,
          items: [],
          totalAmount: 0,
          totalCartItems: 0
        }
      });
    }

    // Return the cart
    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart"
    });
  }
};

// DELETE CART ITEM
const deleteSingleCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required to remove from cart",
      });
    }

    const cart = await Cart.findOne({ userId: req.userInfo.id }).populate(
      "items.productId"
    );

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // filter out the item
    const newItems = cart.items.filter(
      (item) => item.productId._id.toString() !== productId.toString()
    );

    if (newItems.length === cart.items.length) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart" });
    }

    cart.items = newItems;

    // recalculate totals
    cart.totalAmount = cart.items.reduce(
      (acc, item) => acc + item.productId.price * item.quantity,
      0
    );

    cart.totalCartItems = cart.items.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Delete cart item error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE CART QUANTITY
const updateCartItemQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!productId || !quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid productId and quantity are required",
      });
    }

    const cart = await Cart.findOne({ userId: req.userInfo.id }).populate(
      "items.productId"
    );

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const cartItem = cart.items.find(
      (item) => item.productId._id.toString() === productId.toString()
    );

    if (!cartItem) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart" });
    }

    cartItem.quantity = parseInt(quantity);

    // recalculate totals
    cart.totalAmount = cart.items.reduce(
      (acc, item) => acc + item.productId.price * item.quantity,
      0
    );

    cart.totalCartItems = cart.items.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({ success: true, message: "Cart updated", cart });
  } catch (error) {
    console.error("Update cart quantity error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addToCart,
  getCart,
  deleteSingleCartItem,
  updateCartItemQuantity,
};
