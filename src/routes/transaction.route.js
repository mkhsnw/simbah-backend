const express = require("express");
const { validateAuth } = require("../middleware/auth.middleware.");
const { validateTransaction } = require("../model/transaction.validator");
const {
  createTransactionController,
  getAllTransactionsController,
  getAllTransactionsByUserController,
  getReportDataController,
  editTransactionController,
  deleteTransactionController,
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
router.get("/report", validateAuth, getReportDataController);
router.put("/:id", validateAuth, editTransactionController);
router.delete("/:id", validateAuth, deleteTransactionController)

module.exports = router;
