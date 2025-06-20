const express = require("express");
const { validateAuth } = require("../middleware/auth.middleware.");
const { validateTransaction } = require("../model/transaction.validator");
const createTransactionController = require("../controller/transaction.controller");

const router = express.Router();

router.post(
  "/",
  validateAuth,
  validateTransaction,
  createTransactionController
);

module.exports = router;
