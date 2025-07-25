require("dotenv").config();
const db = require("./config/db");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const auth = require("./middleware/authMiddleware");

//routers start here
const userRouter = require("./route/userRoute");
const productRouter = require("./route/productRoute");
const cartRouter = require("./route/cartRoute");
const orderRouter = require("./route/orderRoute");

//middleware start here
const allowedOrigins = [
  "http://localhost:5173",
  "https://kcommence-eta-six-71.vercel.app"
];

// Log the actual CORS_ORIGIN value for debugging
console.log('CORS_ORIGIN from env:', process.env.CORS_ORIGIN);

// Add CORS_ORIGIN if it exists and isn't already in the array
if (process.env.CORS_ORIGIN && !allowedOrigins.includes(process.env.CORS_ORIGIN)) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

app.use(
  cors({
    origin: function(origin, callback) {
      console.log('Request origin:', origin); // Debug log
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('Origin blocked:', origin, 'Allowed origins:', allowedOrigins); // For debugging
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['set-cookie']
  })
);

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('origin')}`);
  console.log('Headers:', req.headers); // Add headers logging
  next();
});

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Add a basic health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/Auth", userRouter);
app.use("/api/Product", productRouter);
app.use("/api/Cart", cartRouter);
app.use("/api/Order", orderRouter);

app.get("/test", auth, (req, res) => {
  return res.status(200).json({ message: "testing" });
});

const port = process.env.PORT || 3000;

// Improve error handling for the database connection
db().catch(err => {
  console.error("Database connection error:", err);
  process.exit(1);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server started on port ${port}`);
  console.log('Allowed Origins:', JSON.stringify(allowedOrigins, null, 2));
});
