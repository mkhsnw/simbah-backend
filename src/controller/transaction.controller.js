const {
  createDepositTransaction,
  createWithdrawTransaction,
  getAllTransactions,
  getTransactionByUser,
} = require("../services/transaction.services");

const createTransactionController = async (req, res, next) => {
  try {
    console.log(req.body);
    const userId = req.user.id;
    const { type, ...data } = req.body;

    let newTransaction;
    if (type === "DEPOSIT") {
      newTransaction = await createDepositTransaction(data, userId);
      return res.status(201).json({
        success: true,
        message: "Deposit transaction created successfully",
        data: newTransaction,
      });
    } else if (type === "WITHDRAWAL") {
      newTransaction = await createWithdrawTransaction(data, userId);
      return res.status(201).json({
        success: true,
        message: "Withdrawal transaction created successfully",
        data: newTransaction,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction type Must be 'Deposit' or 'Withdrawal'",
      });
    }
  } catch (error) {
    next(error);
  }
};

const getAllTransactionsController = async (req, res, next) => {
  try {
    const transactions = await getAllTransactions();
    if (!transactions || transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No transactions found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Transactions retrieved successfully",
      data: transactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getAllTransactionsByUserController = async (req, res, next) => {
  try {
    const { id } = req.user;
    const transactions = await getTransactionByUser(id);
    return res.status(200).json({
      success: true,
      message: "Transactions retrieved successfully",
      data: transactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createTransactionController,
  getAllTransactionsController,
  getAllTransactionsByUserController,
};
