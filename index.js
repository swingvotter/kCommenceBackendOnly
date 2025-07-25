require("dotenv").config();
const db = require("./config/db");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const auth = require("./middleware/authMiddleware");

// Routes
const userRouter = require("./route/userRoute");
const productRouter = require("./route/productRoute");
const cartRouter = require("./route/cartRoute");
const orderRouter = require("./route/orderRoute");

// ✅ Use correct cors() middleware
app.use(
  cors({
    origin: "https://kcommence-eta-six-71.vercel.app", // or process.env.CORS_ORIGIN
    credentials: true,
  })
);

// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get("origin")}`);
  next();
});

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is running" });
});

// Routes
app.use("/api/Auth", userRouter);
app.use("/api/Product", productRouter);
app.use("/api/Cart", cartRouter);
app.use("/api/Order", orderRouter);

// Protected test
app.get("/test", auth, (req, res) => {
  res.status(200).json({ message: "Protected route success" });
});

// Server
const port = process.env.PORT || 3000;
db()
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server started on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  });
