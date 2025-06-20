const {
  createDepositTransaction,
  createWithdrawTransaction,
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

module.exports = createTransactionController;
