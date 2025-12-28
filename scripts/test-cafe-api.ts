import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCafeData() {
  try {
    const cafes = await prisma.cafe.findMany({
      take: 1,
      include: {
        openingHours: true,
        paymentMethods: {
          include: {
            paymentMethod: true,
          },
        },
        images: true,
        facilities: {
          include: {
            facility: true,
          },
        },
      },
    });

    const cafe = cafes[0];

    console.log('\n=== CAFE DATA ===');
    console.log('Name:', cafe.name);
    console.log('Opening Hours Count:', cafe.openingHours?.length || 0);
    console.log('\n=== OPENING HOURS ===');

    if (cafe.openingHours && cafe.openingHours.length > 0) {
      cafe.openingHours.forEach((oh) => {
        console.log(`\n${oh.dayOfWeek}:`);
        console.log('  openTime:', oh.openTime);
        console.log('  closeTime:', oh.closeTime);
        console.log('  openTime type:', typeof oh.openTime);
        console.log('  closeTime type:', typeof oh.closeTime);
        console.log('  isClosed:', oh.isClosed);
        console.log('  isOpen24Hours:', oh.isOpen24Hours);
      });
    } else {
      console.log('❌ NO OPENING HOURS FOUND!');
    }

    console.log('\n=== SERIALIZED JSON (as API would return) ===');
    console.log(JSON.stringify(cafe, null, 2).substring(0, 1000) + '...');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCafeData();
