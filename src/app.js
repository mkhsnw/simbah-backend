const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.route");
const wasteRoutes = require("./routes/waste.route");
const transactionRoutes = require("./routes/transaction.route");
const rateLimit = require("express-rate-limit");
const userRoutes = require("./routes/user.route");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/v1/", limiter);

// Routes
app.use("/v1s/auth", authRoutes);
app.use("/v1/waste", wasteRoutes);
app.use("/v1/transaction", transactionRoutes);
app.use("/v1/user", userRoutes);

app.get("/", (req, res) => {
  res.send({
    message: "Welcome to the Simbah API",
    version: "1.0.0",
    status: "Running",
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error("Global error:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong!"
        : err.message,
  });
});

module.exports = app;
