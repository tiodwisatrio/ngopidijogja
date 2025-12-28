const { PrismaClient } = require('@prisma/client');

async function testAPI() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing Prisma connection...');
    
    const cafes = await prisma.cafe.findMany({
      include: {
        openingHours: true,
        paymentMethods: {
          include: {
            paymentMethod: true,
          },
        },
      },
    });
    
    console.log('✓ Successfully fetched cafes');
    console.log('Total cafes:', cafes.length);
    
    // Test serialization
    const testCafe = cafes[0];
    console.log('\nSample cafe data:');
    console.log('- ID type:', typeof testCafe.id);
    console.log('- Latitude type:', typeof testCafe.latitude);
    console.log('- Facilities:', testCafe.facilities);
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
