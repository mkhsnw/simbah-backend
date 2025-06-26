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

const getReportData = async (userId) => {
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
    });
    const totalDeposit = transactions
      .filter((transaction) => transaction.type === "DEPOSIT")
      .reduce(
        (total, transaction) => total + Number(transaction.totalAmount),
        0
      );

    const totalWithdraw = transactions
      .filter((transaction) => transaction.type === "WITHDRAWAL")
      .reduce(
        (total, transaction) => total + Number(transaction.totalAmount),
        0
      );

    const totalTransaction = transactions.length;

    const totalWasteWeight = transactions
      .filter((transaction) => transaction.type === "DEPOSIT")
      .reduce((total, transaction) => {
        if (transaction.items && transaction.items.length > 0) {
          const transactionWeight = transaction.items.reduce((acc, item) => {
            return acc + Number(item.weightInKg);
          }, 0);
          return total + transactionWeight;
        }
        return total;
      }, 0);

    const depositCount = transactions.filter(
      (t) => t.type === "DEPOSIT"
    ).length;
    const withdrawalCount = transactions.filter(
      (t) => t.type === "WITHDRAWAL"
    ).length;

    // 7. Current balance dari user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });

    return {
      totalDeposit,
      totalWithdraw,
      totalTransaction,
      totalWasteWeight,
      depositCount,
      withdrawalCount,
      currentBalance: user ? Number(user.balance) : 0,
      averageDepositAmount: depositCount > 0 ? totalDeposit / depositCount : 0,
      averageWithdrawAmount:
        withdrawalCount > 0 ? totalWithdraw / withdrawalCount : 0,
    };
  } catch (error) {
    console.error("Error fetching report data:", error);
    throw new Error("Failed to fetch report data.");
  }
};

const editTransaction = async (transactionId, updateData, userId) => {
  return prisma.$transaction(async (tx) => {
    try {
      console.log("=== EDIT TRANSACTION START ===");
      console.log("Transaction ID:", transactionId);
      console.log("Update Data:", updateData);
      console.log("User ID:", userId);

      // 1. Ambil transaksi yang akan diedit beserta data terkait
      const currentTransaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          items: {
            include: {
              wasteCategory: true,
            },
          },
          user: true,
        },
      });

      if (!currentTransaction) {
        throw new Error("Transaction not found");
      }

      const oldTotalAmount = Number(currentTransaction.totalAmount);
      console.log("Old total amount:", oldTotalAmount);

      let newTotalAmount = oldTotalAmount;

      if (currentTransaction.type === "DEPOSIT") {
        newTotalAmount = await handleDepositEdit(
          tx,
          currentTransaction,
          updateData
        );
      } else if (currentTransaction.type === "WITHDRAWAL") {
        newTotalAmount = await handleWithdrawalEdit(
          tx,
          currentTransaction,
          updateData
        );
      }

      console.log("New total amount:", newTotalAmount);

      if (oldTotalAmount !== newTotalAmount) {
        await updateUserBalanceOnEdit(
          tx,
          userId,
          currentTransaction.type,
          oldTotalAmount,
          newTotalAmount
        );
      }

      // 6. Update record transaksi
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          description: updateData.description || currentTransaction.description,
          totalAmount: newTotalAmount,
          updatedAt: new Date(),
        },
      });

      // 7. Return data lengkap
      return await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          items: {
            include: {
              wasteCategory: true,
            },
          },
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
    } catch (error) {
      console.error("Error editing transaction:", error);
      throw error;
    }
  });
};

const handleDepositEdit = async (tx, currentTransaction, updateData) => {
  let newTotalAmount = 0;

  // Jika ada perubahan items
  if (
    updateData.items &&
    Array.isArray(updateData.items) &&
    updateData.items.length > 0
  ) {
    console.log("Updating items for DEPOSIT transaction");

    await tx.transactionItem.deleteMany({
      where: { transactionId: currentTransaction.id },
    });

    const itemCreationData = [];

    for (const item of updateData.items) {
      const wasteCategory = await tx.wasteCategory.findUnique({
        where: { id: item.wasteCategoryId },
      });

      if (!wasteCategory) {
        throw new Error(
          `Waste category with ID ${item.wasteCategoryId} not found`
        );
      }

      const subtotal =
        Number(wasteCategory.pricePerKg) * Number(item.weightInKg);
      newTotalAmount += subtotal;

      itemCreationData.push({
        transactionId: currentTransaction.id,
        wasteCategoryId: item.wasteCategoryId,
        weightInKg: Number(item.weightInKg),
        subtotal: subtotal,
      });
    }

    if (itemCreationData.length > 0) {
      await tx.transactionItem.createMany({
        data: itemCreationData,
      });
    }

    console.log("New total calculated from items:", newTotalAmount);
  } else {
    if (updateData.totalAmount !== undefined) {
      console.log(
        "⚠️ WARNING: Manual totalAmount update for DEPOSIT (not recommended)"
      );
      newTotalAmount = Number(updateData.totalAmount);
    } else {
      newTotalAmount = Number(currentTransaction.totalAmount);
    }
  }

  return newTotalAmount;
};

const handleWithdrawalEdit = async (tx, currentTransaction, updateData) => {
  let newAmount = Number(currentTransaction.totalAmount);

  if (updateData.totalAmount !== undefined) {
    newAmount = Number(updateData.totalAmount);
    console.log(
      "Updating withdrawal amount from",
      currentTransaction.totalAmount,
      "to",
      newAmount
    );

    const currentUser = await tx.user.findUnique({
      where: { id: currentTransaction.userId },
    });

    const balanceAfterRollback =
      Number(currentUser.balance) + Number(currentTransaction.totalAmount);
    console.log("Balance after rollback:", balanceAfterRollback);

    if (balanceAfterRollback < newAmount) {
      throw new Error(
        `Insufficient balance. Available: Rp ${balanceAfterRollback.toLocaleString()}, Required: Rp ${newAmount.toLocaleString()}`
      );
    }
  }

  return newAmount;
};

const updateUserBalanceOnEdit = async (
  tx,
  userId,
  transactionType,
  oldAmount,
  newAmount
) => {
  const amountDifference = newAmount - oldAmount;
  console.log("Balance adjustment needed:", amountDifference);

  if (transactionType === "DEPOSIT") {
    await tx.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: amountDifference,
        },
      },
    });
  } else if (transactionType === "WITHDRAWAL") {
    await tx.user.update({
      where: { id: userId },
      data: {
        balance: {
          decrement: amountDifference,
        },
      },
    });
  }

  console.log("User balance updated by:", amountDifference);
};

const deleteTransaction = async (transactionId, userId, userRole) => {
  return prisma.$transaction(async (tx) => {
    try {
      console.log("=== DELETE TRANSACTION START ===");
      console.log("Transaction ID:", transactionId);
      console.log("User ID:", userId);
      console.log("User Role:", userRole);

      // 1. Ambil data transaksi yang akan dihapus
      const transactionToDelete = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          items: {
            include: {
              wasteCategory: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              balance: true
            }
          }
        }
      });

      if (!transactionToDelete) {
        throw new Error("Transaction not found");
      }

      console.log("Transaction found:", {
        id: transactionToDelete.id,
        type: transactionToDelete.type,
        totalAmount: transactionToDelete.totalAmount,
        userId: transactionToDelete.userId
      });

      const transactionAmount = Number(transactionToDelete.totalAmount);
      
      if (transactionToDelete.type === "DEPOSIT") {
        const currentUser = await tx.user.findUnique({
          where: { id: transactionToDelete.userId }
        });

        if (Number(currentUser.balance) < transactionAmount) {
          throw new Error(
            `Cannot delete transaction. Insufficient balance for rollback. ` +
            `Current balance: Rp ${Number(currentUser.balance).toLocaleString()}, ` +
            `Required: Rp ${transactionAmount.toLocaleString()}`
          );
        }

        await tx.user.update({
          where: { id: transactionToDelete.userId },
          data: {
            balance: {
              decrement: transactionAmount
            }
          }
        });

        console.log(`DEPOSIT rollback: Reduced balance by ${transactionAmount}`);

      } else if (transactionToDelete.type === "WITHDRAWAL") {
        await tx.user.update({
          where: { id: transactionToDelete.userId },
          data: {
            balance: {
              increment: transactionAmount
            }
          }
        });

        console.log(`WITHDRAWAL rollback: Added balance by ${transactionAmount}`);
      }

      if (transactionToDelete.items && transactionToDelete.items.length > 0) {
        await tx.transactionItem.deleteMany({
          where: { transactionId: transactionId }
        });
        console.log(`Deleted ${transactionToDelete.items.length} transaction items`);
      }

      await tx.transaction.delete({
        where: { id: transactionId }
      });

      console.log("Transaction deleted successfully");

      return {
        deletedTransaction: {
          id: transactionToDelete.id,
          type: transactionToDelete.type,
          totalAmount: transactionToDelete.totalAmount,
          description: transactionToDelete.description,
          createdAt: transactionToDelete.createdAt
        },
        balanceAdjustment: {
          type: transactionToDelete.type === "DEPOSIT" ? "decreased" : "increased",
          amount: transactionAmount
        }
      };

    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  });
};

module.exports = {
  createDepositTransaction,
  createWithdrawTransaction,
  editTransaction,
  deleteTransaction,
  getAllTransactions,
  getTransactionByUser,
  getReportData,
};
