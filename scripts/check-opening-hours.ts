import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOpeningHours() {
  try {
    const openingHours = await prisma.openingHour.findMany({
      take: 10,
      include: {
        cafe: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`\n📊 Total opening hours found: ${openingHours.length}\n`);

    openingHours.forEach((oh) => {
      console.log(`Cafe: ${oh.cafe.name}`);
      console.log(`Day: ${oh.dayOfWeek}`);
      console.log(`Open: ${oh.openTime} - Close: ${oh.closeTime}`);
      console.log(`isClosed: ${oh.isClosed}, isOpen24Hours: ${oh.isOpen24Hours}`);
      console.log('---');
    });

    // Count total
    const total = await prisma.openingHour.count();
    console.log(`\n✅ Total opening hours in database: ${total}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOpeningHours();
