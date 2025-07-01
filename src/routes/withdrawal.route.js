const express = require("express");
const router = express.Router();
const {
  requestWithdrawal,
  getMyWithdrawalRequests,
  cancelMyWithdrawalRequest,
  getAllRequests,
  processRequest,
  getRequestStats,
} = require("../controller/withdrawalRequest.controller");
const { validateAuth } = require("../middleware/auth.middleware.");

router.post("/", validateAuth, requestWithdrawal);
router.get("/my-requests", validateAuth, getMyWithdrawalRequests);
router.patch("/:requestId/cancel", validateAuth, cancelMyWithdrawalRequest);

router.get("/admin/all", validateAuth, getAllRequests);
router.patch("/admin/:requestId/process", validateAuth, processRequest);
router.get("/admin/stats", validateAuth, getRequestStats);

module.exports = router;
