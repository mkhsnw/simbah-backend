const { prisma } = require("../config/database");

const createWithdrawalRequest = async (requestData, userId) => {
  const { amount, description } = requestData;

  return prisma.$transaction(async (tx) => {
    // 1. Cek saldo user
    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (Number(user.balance) < Number(amount)) {
      const error = new Error(
        `Insufficient balance. Current balance: Rp ${Number(
          user.balance
        ).toLocaleString()}, Requested: Rp ${Number(amount).toLocaleString()}`
      );
      error.statusCode = 400;
      throw error;
    }

    // 2. Cek apakah user punya pending request
    const pendingRequest = await tx.withdrawalRequest.findFirst({
      where: {
        userId: userId,
        status: "PENDING",
      },
    });

    if (pendingRequest) {
      const error = new Error("You already have a pending withdrawal request");
      error.statusCode = 400;
      throw error;
    }

    // 3. Buat withdrawal request
    const withdrawalRequest = await tx.withdrawalRequest.create({
      data: {
        userId: userId,
        amount: Number(amount),
        description:
          description ||
          `Withdrawal request - Rp ${Number(amount).toLocaleString()}`,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            balance: true,
          },
        },
      },
    });

    return withdrawalRequest;
  });
};

const getUserWithdrawalRequests = async (userId) => {
  try {
    const requests = await prisma.withdrawalRequest.findMany({
      where: { userId: userId },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        transaction: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        requestedAt: "desc",
      },
    });

    return requests;
  } catch (error) {
    console.error("Error fetching user withdrawal requests:", error);
    throw new Error("Failed to fetch withdrawal requests");
  }
};

const getAllWithdrawalRequests = async (status = null) => {
  try {
    const whereClause = status ? { status: status } : {};

    const requests = await prisma.withdrawalRequest.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            balance: true,
            rekening: true,
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        transaction: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // PENDING first
        { requestedAt: "desc" },
      ],
    });

    return requests;
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    throw new Error("Failed to fetch withdrawal requests");
  }
};

const processWithdrawalRequest = async (
  requestId,
  action,
  adminId,
  adminNote = null
) => {
  return prisma.$transaction(async (tx) => {
    // 1. Ambil withdrawal request
    const withdrawalRequest = await tx.withdrawalRequest.findUnique({
      where: { id: requestId },
      include: {
        user: true,
      },
    });

    if (!withdrawalRequest) {
      throw new Error("Withdrawal request not found");
    }

    if (withdrawalRequest.status !== "PENDING") {
      throw new Error(
        `Cannot process request with status: ${withdrawalRequest.status}`
      );
    }

    const updateData = {
      adminId: adminId,
      adminNote: adminNote,
      processedAt: new Date(),
      status: action,
    };

    // 2. Jika APPROVED, buat transaction dan kurangi saldo
    if (action === "APPROVED") {
      // Cek saldo user lagi (safety check)
      const currentUser = await tx.user.findUnique({
        where: { id: withdrawalRequest.userId },
      });

      if (Number(currentUser.balance) < Number(withdrawalRequest.amount)) {
        throw new Error("Insufficient balance for withdrawal");
      }

      // Buat transaction WITHDRAWAL
      const transaction = await tx.transaction.create({
        data: {
          userId: withdrawalRequest.userId,
          type: "WITHDRAWAL",
          totalAmount: withdrawalRequest.amount,
          description:
            withdrawalRequest.description ||
            `Approved withdrawal - Rp ${Number(
              withdrawalRequest.amount
            ).toLocaleString()}`,
        },
      });

      // Update saldo user
      await tx.user.update({
        where: { id: withdrawalRequest.userId },
        data: {
          balance: {
            decrement: withdrawalRequest.amount,
          },
        },
      });

      // Link transaction ke withdrawal request
      updateData.transactionId = transaction.id;
    }

    // 3. Update withdrawal request
    const updatedRequest = await tx.withdrawalRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            balance: true,
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        transaction: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
    });

    return updatedRequest;
  });
};

const cancelWithdrawalRequest = async (requestId, userId) => {
  try {
    // Cek ownership dan status
    const withdrawalRequest = await prisma.withdrawalRequest.findFirst({
      where: {
        id: requestId,
        userId: userId,
        status: "PENDING",
      },
    });

    if (!withdrawalRequest) {
      throw new Error("Withdrawal request not found or cannot be cancelled");
    }

    // Update status ke CANCELLED
    const cancelledRequest = await prisma.withdrawalRequest.update({
      where: { id: requestId },
      data: {
        status: "CANCELLED",
        processedAt: new Date(),
      },
    });

    return cancelledRequest;
  } catch (error) {
    console.error("Error cancelling withdrawal request:", error);
    throw error;
  }
};

const getWithdrawalRequestStats = async () => {
  try {
    const stats = await prisma.withdrawalRequest.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
      _sum: {
        amount: true,
      },
    });

    const formattedStats = {
      pending: { count: 0, totalAmount: 0 },
      approved: { count: 0, totalAmount: 0 },
      rejected: { count: 0, totalAmount: 0 },
      cancelled: { count: 0, totalAmount: 0 },
    };

    stats.forEach((stat) => {
      const status = stat.status.toLowerCase();
      formattedStats[status] = {
        count: stat._count.status,
        totalAmount: Number(stat._sum.amount) || 0,
      };
    });

    return formattedStats;
  } catch (error) {
    console.error("Error fetching withdrawal request stats:", error);
    throw new Error("Failed to fetch withdrawal request statistics");
  }
};

module.exports = {
  createWithdrawalRequest,
  getUserWithdrawalRequests,
  getAllWithdrawalRequests,
  processWithdrawalRequest,
  cancelWithdrawalRequest,
  getWithdrawalRequestStats,
};
