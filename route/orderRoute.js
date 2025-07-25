const { placeOrder, webhook } = require("../controller/order");
const express = require("express");
const router = express.Router();
const Auth = require("../middleware/authMiddleware");

router.post("/pay", Auth, placeOrder);
router.post("/webhook", webhook);

module.exports = router;
