// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Import helper function (sesuaikan path-nya)
const { generateAccountNumber } = require("../src/utils/helper");

async function main() {
  console.log("🌱 Starting database seeding...");

  const saltRounds = 12; // Sama dengan yang di auth.services.js

  // Seed Admin User
  const adminPassword = await bcrypt.hash("admin123", saltRounds);
  const adminAccount = generateAccountNumber();

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@simbah.com" },
    update: {
      // Update data jika sudah ada
      name: "Admin Simbah",
      role: "ADMIN",
    },
    create: {
      email: "admin@gmail.com",
      name: "Admin Simbah",
      password: adminPassword,
      rekening: adminAccount,
      role: "ADMIN",
      balance: 0,
    },
  });

  console.log("✅ Admin user created/updated:", {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: adminUser.role,
    rekening: adminUser.rekening,
  });

  // Seed Regular Users
  const users = [
    {
      email: "user1@gmail.com",
      name: "John Doe",
      password: "user123",
      role: "USER",
    },
    {
      email: "user2@gmail.com",
      name: "Jane Smith",
      password: "user123",
      role: "USER",
    },
    {
      email: "collector@gmail.com",
      name: "Waste Collector",
      password: "collector123",
      role: "USER",
    },
  ];

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    const accountNumber = generateAccountNumber();

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        role: userData.role,
      },
      create: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        rekening: accountNumber,
        role: userData.role,
        balance: 0,
      },
    });

    console.log(`✅ User created/updated: ${user.email} (${user.role})`);
  }

  // Seed Waste Categories
  const wasteCategories = [
    { name: "Botol Plastik PET", pricePerKg: 3000 },
    { name: "Botol Plastik HDPE", pricePerKg: 2500 },
    { name: "Kaleng Aluminium", pricePerKg: 15000 },
    { name: "Kertas Koran", pricePerKg: 1500 },
    { name: "Kertas Kardus", pricePerKg: 2000 },
    { name: "Besi/Logam", pricePerKg: 5000 },
    { name: "Botol Kaca", pricePerKg: 1000 },
    { name: "Plastik Campur", pricePerKg: 1800 },
  ];

  for (const category of wasteCategories) {
    const wasteCategory = await prisma.wasteCategory.upsert({
      where: { name: category.name },
      update: {
        pricePerKg: category.pricePerKg,
      },
      create: {
        name: category.name,
        pricePerKg: category.pricePerKg,
      },
    });

    console.log(
      `✅ Waste category created/updated: ${wasteCategory.name} - Rp${wasteCategory.pricePerKg}/kg`
    );
  }

  console.log("\n🎉 Seeding completed successfully!");

  // Summary
  const totalUsers = await prisma.user.count();
  const totalCategories = await prisma.wasteCategory.count();

  console.log("\n📊 Database Summary:");
  console.log(`👥 Total Users: ${totalUsers}`);
  console.log(`🗂️ Total Waste Categories: ${totalCategories}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 Database connection closed");
  });
