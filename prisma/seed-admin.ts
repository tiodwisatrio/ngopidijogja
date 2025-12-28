import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating admin user...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@cafe.local" },
    update: {},
    create: {
      email: "admin@cafe.local",
      password: hashedPassword,
      name: "Admin User",
      role: "admin",
    },
  });

  console.log("Admin user created:", adminUser.email);
  console.log("Login credentials:");
  console.log("  Email: admin@cafe.local");
  console.log("  Password: admin123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
