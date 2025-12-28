import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Create payment methods
  const cash = await prisma.paymentMethod.create({
    data: {
      code: "cash",
      label: "Cash",
    },
  });

  const qris = await prisma.paymentMethod.create({
    data: {
      code: "qris",
      label: "QRIS",
    },
  });

  const debit = await prisma.paymentMethod.create({
    data: {
      code: "debit",
      label: "Debit",
    },
  });

  console.log("Created payment methods:", { cash, qris, debit });

  // Create cafe
  const cafe = await prisma.cafe.create({
    data: {
      slug: "blanco-coffee-books",
      name: "Blanco Coffee & Books",
      address: "Jl. Kranggan No.30, Jetis, Yogyakarta",
      latitude: -7.7956,
      longitude: 110.3695,
      googleMapsUrl: "https://maps.app.goo.gl/zVxTkqYWzybtReNQ07",
      instagramUrl: "@blancoCoffeeid",
      parking: "Motor & Mobil",
    },
  });

  console.log("Created cafe:", cafe);

  // Create opening hours
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  for (const day of days) {
    await prisma.openingHour.create({
      data: {
        cafeId: cafe.id,
        dayOfWeek: day,
        openTime: new Date("2000-01-01T09:00:00"),
        closeTime: new Date("2000-01-01T23:00:00"),
        isClosed: false,
      },
    });
  }

  console.log("Created opening hours for all days");

  // Add payment methods to cafe
  await prisma.cafePaymentMethod.create({
    data: {
      cafeId: cafe.id,
      paymentMethodId: cash.id,
    },
  });

  await prisma.cafePaymentMethod.create({
    data: {
      cafeId: cafe.id,
      paymentMethodId: qris.id,
    },
  });

  await prisma.cafePaymentMethod.create({
    data: {
      cafeId: cafe.id,
      paymentMethodId: debit.id,
    },
  });

  console.log("Added payment methods to cafe");

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

  console.log("Created admin user:", adminUser.email);
  console.log("Seeding completed!");
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
