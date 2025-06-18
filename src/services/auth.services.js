const { prisma } = require("../config/database");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/token");
const { generateAccountNumber } = require("../utils/helper");

const registerUser = async (userData) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    const accountNumber = generateAccountNumber();

    if (existingUser.rekening === accountNumber) {
      throw new Error("Account number already exists, please try again.");
    }

    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        role: userData.role || "USER",
        name: userData.name || "",
        rekening: accountNumber,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        createdAt: true,
      },
    });
    return newUser;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

const loginUser = async (email, password) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new Error("User not found with this email");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    const token = generateToken(user);
    return {
      user: user,
      token: token,
    };
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

module.exports = { registerUser, loginUser };
