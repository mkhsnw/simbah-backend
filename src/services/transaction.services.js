const { prisma } = require("../config/database");

const createDepositTransaction = async (transactionData, userId) => {
  const { description, items } = transactionData;

  if (!items || items.length === 0) {
    const error = new Error("Items are required for a deposit transaction.");
    error.statusCode = 400;
    throw error;
  }

  // Gunakan database transaction untuk memastikan semua operasi berhasil atau gagal bersamaan.
  return prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    const itemCreationData = [];

    // 1. Validasi setiap item dan hitung totalAmount
    for (const item of items) {
      const wasteCategory = await tx.wasteCategory.findUnique({
        where: { id: item.wasteCategoryId },
      });

      if (!wasteCategory) {
        throw new Error(
          `Waste category with ID ${item.wasteCategoryId} not found.`
        );
      }

      const subtotal =
        Number(wasteCategory.pricePerKg) * Number(item.weightInKg);
      totalAmount += subtotal;

      itemCreationData.push({
        wasteCategoryId: item.wasteCategoryId,
        weightInKg: item.weightInKg,
        subtotal: subtotal,
      });
    }

    // 2. Buat record Transaction utama
    const transaction = await tx.transaction.create({
      data: {
        userId: userId,
        type: "DEPOSIT",
        description: description,
        totalAmount: totalAmount,
      },
    });

    // 3. Buat record TransactionItem untuk setiap item
    await tx.transactionItem.createMany({
      data: itemCreationData.map((item) => ({
        transactionId: transaction.id,
        ...item,
      })),
    });

    // 4. Update saldo user
    await tx.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: totalAmount,
        },
      },
    });

    // 5. Kembalikan data transaksi yang lengkap
    return tx.transaction.findUnique({
      where: { id: transaction.id },
      include: {
        items: {
          include: {
            wasteCategory: true,
          },
        },
      },
    });
  });
};

const createWithdrawTransaction = async (transactionData, userId) => {
  const { description, amount } = transactionData;

  return prisma.$transaction(async (tx) => {
    // 1. Ambil data user dan periksa saldo
    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    if (Number(user.balance) < Number(amount)) {
      const error = new Error("Insufficient balance for withdrawal.");
      error.statusCode = 400;
      throw error;
    }

    // 2. Buat record Transaction
    const transaction = await tx.transaction.create({
      data: {
        userId: userId,
        type: "WITHDRAWAL",
        description: description,
        totalAmount: amount,
      },
    });

    // 3. Kurangi saldo user
    await tx.user.update({
      where: { id: userId },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    return transaction;
  });
};

const getAllTransactions = async () => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            balance: true,
            role: true,
          },
        },
        items: {
          include: {
            wasteCategory: true,
            transaction: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return transactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions.");
  }
};

const getTransactionByUser = async (userId) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: userId },
      include: {
        items: {
          include: {
            wasteCategory: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return transactions;
  } catch (error) {
    console.error("Error fetching transactions by user:", error);
    throw new Error("Failed to fetch transactions for the user.");
  }
};

module.exports = {
  createDepositTransaction,
  createWithdrawTransaction,
  getAllTransactions,
  getTransactionByUser,
};
