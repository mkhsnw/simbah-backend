const express = require("express");
const { validateAuth } = require("../middleware/auth.middleware.");
const { validateTransaction } = require("../model/transaction.validator");
const {
  createTransactionController,
  getAllTransactionsController,
  getAllTransactionsByUserController,
} = require("../controller/transaction.controller");
const router = express.Router();

router.post(
  "/",
  validateAuth,
  validateTransaction,
  createTransactionController
);

router.get("/", validateAuth, getAllTransactionsController);
router.get("/user", validateAuth, getAllTransactionsByUserController);

module.exports = router;
