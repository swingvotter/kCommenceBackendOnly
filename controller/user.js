const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register route
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    email,
    password: hashedPassword,
  });

  await user.save();

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: { username: user.username, email: user.email },
  });
};

// Login route
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.HIDDEN_PHRASE, {
      expiresIn: "1h",
    });

    // Send as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60, // 1 hour
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: "/",
      domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : 'localhost'
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        username: user.username,
        email: user.email,
        addresses: user.addresses,
        defaultAddress: user.defaultAddress,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // match login cookie
    path: "/",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

const profile = async (req, res) => {
  try {
    const user = await User.findById(req.userInfo.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    res.status(200).json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        addresses: user.addresses,
        defaultAddress: user.defaultAddress,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add or update address

module.exports = { registerUser, loginUser, profile, logoutUser };
