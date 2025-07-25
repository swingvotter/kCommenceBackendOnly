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
  process.env.CORS_ORIGIN,
  "*" // Temporarily allow all origins during deployment testing
];

app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

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

const port = process.env.PORT || 6000;

// Improve error handling for the database connection
db().catch(err => {
  console.error("Database connection error:", err);
  process.exit(1);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`server started on port ${port}`);
});
