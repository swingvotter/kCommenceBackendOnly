const {
  addToCart,
  getCart,
  deleteSingleCartItem,
  updateCartItemQuantity,
} = require("../controller/cart");
const express = require("express");
const router = express.Router();
const Auth = require("../middleware/authMiddleware");

router.post("/add", Auth, addToCart);
router.get("/getall", Auth, getCart);
router.patch("/edit/:productId", Auth, updateCartItemQuantity);
router.delete("/delete/:productId", Auth, deleteSingleCartItem);

module.exports = router;
