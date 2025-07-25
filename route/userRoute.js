const {
  registerUser,
  loginUser,
  logoutUser,
  profile,
} = require("../controller/user");
const express = require("express");
const Auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", Auth, profile);

module.exports = router;
