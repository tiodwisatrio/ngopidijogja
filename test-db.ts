import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const cafes = await prisma.cafe.findMany();
    console.log("Connection successful! Cafes:", cafes);
  } catch (error) {
    console.error("Connection error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
