const { prisma } = require("../config/database");
const { verivyToken } = require("../utils/token");

const getAllUser = async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        rekening: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users.");
  }
};

const editUser = async (userId, userData) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        rekening: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return updatedUser;
  } catch (error) {
    console.error("Error editing user:", error);
    throw new Error("Failed to edit user.");
  }
};

const deleteUser = async (userId) => {
  try {
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });
    return deletedUser;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user.");
  }
};

const getUserById = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        rekening: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw new Error("Failed to fetch user by ID.");
  }
};

const getUserLogin = async (token) => {
  try {
    const userData = await verivyToken(token);
    if (!userData) {
      throw new Error("Invalid token");
    }
    const user = await prisma.user.findUnique({
      where: { id: userData.id },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        rekening: true,
        role: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by token:", error);
    throw new Error("Failed to fetch user by token.");
  }
};

module.exports = {
  getAllUser,
  getUserById,
  editUser,
  deleteUser,
  getUserLogin,
};
