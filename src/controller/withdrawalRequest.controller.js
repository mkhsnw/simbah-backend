const {
  createWithdrawalRequest,
  getUserWithdrawalRequests,
  getAllWithdrawalRequests,
  processWithdrawalRequest,
  cancelWithdrawalRequest,
  getWithdrawalRequestStats,
} = require("../services/withdrawalRequest.service");

const requestWithdrawal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const withdrawalRequest = await createWithdrawalRequest(req.body, userId);

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully",
      data: withdrawalRequest,
    });
  } catch (error) {
    next(error);
  }
};

const getMyWithdrawalRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const requests = await getUserWithdrawalRequests(userId);

    res.status(200).json({
      success: true,
      message: "Withdrawal requests retrieved successfully",
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

const cancelMyWithdrawalRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const cancelledRequest = await cancelWithdrawalRequest(requestId, userId);

    res.status(200).json({
      success: true,
      message: "Withdrawal request cancelled successfully",
      data: cancelledRequest,
    });
  } catch (error) {
    next(error);
  }
};

const getAllRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const requests = await getAllWithdrawalRequests(status);

    res.status(200).json({
      success: true,
      message: "All withdrawal requests retrieved successfully",
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: Approve/Reject withdrawal request
const processRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { action, adminNote } = req.body;
    const adminId = req.user.id;

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only admins can process withdrawal requests",
      });
    }

    console.log(req.user);

    if (!["APPROVED", "REJECTED"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be APPROVED or REJECTED",
      });
    }

    const processedRequest = await processWithdrawalRequest(
      requestId,
      action,
      adminId,
      adminNote
    );

    res.status(200).json({
      success: true,
      message: `Withdrawal request ${action.toLowerCase()} successfully`,
      data: processedRequest,
    });
  } catch (error) {
    next(error);
  }
};

const getRequestStats = async (req, res, next) => {
  try {
    const stats = await getWithdrawalRequestStats();

    res.status(200).json({
      success: true,
      message: "Withdrawal request statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestWithdrawal,
  getMyWithdrawalRequests,
  cancelMyWithdrawalRequest,
  getAllRequests,
  processRequest,
  getRequestStats,
};
