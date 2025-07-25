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

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://kcommence-eta-six-71.vercel.app",
];

// Log the CORS_ORIGIN from .env (optional override)
console.log("CORS_ORIGIN from env:", process.env.CORS_ORIGIN);

if (
  process.env.CORS_ORIGIN &&
  !allowedOrigins.includes(process.env.CORS_ORIGIN)
) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    try {
      console.log("Request origin:", origin);

      // Allow requests with no origin (e.g., curl, internal services)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("Blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    } catch (error) {
      console.error("CORS error:", error);
      callback(error);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["set-cookie"],
};

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get("origin")}`);
  next();
});

// Health check route for Railway
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is running" });
});

// API Routes
app.use("/api/Auth", userRouter);
app.use("/api/Product", productRouter);
app.use("/api/Cart", cartRouter);
app.use("/api/Order", orderRouter);

// Auth-protected test route
app.get("/test", auth, (req, res) => {
  res.status(200).json({ message: "Protected route success" });
});

// Dynamic port for Railway deployment
const port = process.env.PORT || 3000;

// Connect to DB and start server
db()
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server started on port ${port}`);
      console.log(
        "✅ Allowed Origins:",
        JSON.stringify(allowedOrigins, null, 2)
      );
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  });
