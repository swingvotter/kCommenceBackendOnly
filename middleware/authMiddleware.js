const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.cookies["token"];

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - No token provided",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.HIDDEN_PHRASE);

    // Set user info from decoded token
    req.userInfo = decoded;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = auth;
