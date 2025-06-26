const {
  createDepositTransaction,
  createWithdrawTransaction,
  getAllTransactions,
  getTransactionByUser,
  getReportData,
  editTransaction,
  deleteTransaction,
} = require("../services/transaction.services");

const createTransactionController = async (req, res, next) => {
  try {
    console.log(req.body);
    const userId = req.body.userId;
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

const getReportDataController = async (req, res, next) => {
  try {
    const { id } = req.user;
    const reportData = await getReportData(id);
    return res.status(200).json({
      success: true,
      message: "Report data retrieved successfully",
      data: reportData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const editTransactionController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    // Validasi untuk DEPOSIT: items harus array jika ada
    if (updateData.items && !Array.isArray(updateData.items)) {
      return res.status(400).json({
        success: false,
        message: "Items must be an array",
      });
    }

    const updatedTransaction = await editTransaction(id, updateData, userId);

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: updatedTransaction,
    });
  } catch (error) {
    console.error("Edit transaction controller error:", error);

    if (error.message.includes("Insufficient balance")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

const deleteTransactionController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validasi input
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required"
      });
    }

    const deleteResult = await deleteTransaction(id, userId, userRole);

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
      data: {
        deletedTransaction: deleteResult.deletedTransaction,
        balanceAdjustment: deleteResult.balanceAdjustment
      }
    });

  } catch (error) {
    console.error("Delete transaction controller error:", error);
    
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }
    
    if (error.message.includes("Unauthorized")) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes("Insufficient balance")) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes("older than")) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    next(error);
  }
};

module.exports = {
  createTransactionController,
  getAllTransactionsController,
  getAllTransactionsByUserController,
  getReportDataController,
  editTransactionController,
  deleteTransactionController,
};
