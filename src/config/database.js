const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log("Database connection established successfully.");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit the process with failure
  }
}

module.exports = { connectToDatabase, prisma };
