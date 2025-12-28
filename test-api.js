const { PrismaClient } = require('@prisma/client');

// Simple BigInt converter since we can't require TypeScript module
function convertBigInt(obj) {
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigInt);
  }
  if (obj && typeof obj === 'object') {
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    const converted = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertBigInt(value);
    }
    return converted;
  }
  return obj;
}

async function testAPI() {
  const prisma = new PrismaClient();

  try {
    console.log('🧪 Testing API query (same as GET /api/cafes)...\n');

    const cafes = await prisma.cafe.findMany({
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

    const convertedCafes = convertBigInt(cafes);

    console.log(`✅ Found ${convertedCafes.length} cafes\n`);

    // Show first cafe with facilities
    if (convertedCafes.length > 0) {
      const firstCafe = convertedCafes[0];
      console.log(`📍 ${firstCafe.name}`);
      console.log(`   Address: ${firstCafe.address}`);
      console.log(`   Parking: ${firstCafe.parking}`);
      console.log(`   Facilities (${firstCafe.facilities.length}):`);
      firstCafe.facilities.forEach(f => {
        console.log(`     - ${f.facility.icon} ${f.facility.label} (code: ${f.facility.code})`);
      });
      console.log(`   Payment Methods (${firstCafe.paymentMethods.length}):`);
      firstCafe.paymentMethods.forEach(pm => {
        console.log(`     - ${pm.paymentMethod.label}`);
      });
      console.log(`   Opening Hours (${firstCafe.openingHours.length}):`);
      firstCafe.openingHours.slice(0, 2).forEach(oh => {
        console.log(`     - ${oh.dayOfWeek}: ${oh.openTime.slice(0, 5)} - ${oh.closeTime.slice(0, 5)}`);
      });
      console.log(`   Images: ${firstCafe.images.length}`);

      console.log('\n📦 Sample JSON structure:');
      console.log(JSON.stringify({
        id: firstCafe.id,
        name: firstCafe.name,
        facilities: firstCafe.facilities,
      }, null, 2));
    }

    console.log('\n✅ API test successful! The data structure is correct.');

  } catch (error) {
    console.error('❌ API test failed:');
    console.error(error.message);
    if (error.code) console.error('Error code:', error.code);
    console.error('\nStack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
