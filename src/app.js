const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.route");
const wasteRoutes = require("./routes/waste.route");
const transactionRoutes = require("./routes/transaction.route");
const userRoutes = require("./routes/user.route");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/waste", wasteRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send({
    message: "Welcome to the Simbah API",
    version: "1.0.0",
    status: "Running",
  });
});

module.exports = app;
