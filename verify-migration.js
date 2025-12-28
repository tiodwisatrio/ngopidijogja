const { PrismaClient } = require('@prisma/client');

async function verifyMigration() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Checking facilities table...');
    const facilities = await prisma.facility.findMany();
    console.log(`✅ Found ${facilities.length} facilities:`);
    facilities.forEach(f => console.log(`  - ${f.code}: ${f.label} ${f.icon || ''}`));

    console.log('\n🔍 Checking cafe_facilities junction table...');
    const cafeFacilities = await prisma.cafeFacility.findMany({
      include: {
        cafe: { select: { name: true } },
        facility: { select: { label: true } }
      }
    });
    console.log(`✅ Found ${cafeFacilities.length} cafe-facility relationships:`);
    cafeFacilities.forEach(cf =>
      console.log(`  - ${cf.cafe.name} has ${cf.facility.label}`)
    );

    console.log('\n🔍 Checking cafes with facilities...');
    const cafes = await prisma.cafe.findMany({
      include: {
        facilities: {
          include: {
            facility: true
          }
        }
      }
    });
    console.log(`✅ Found ${cafes.length} cafes:`);
    cafes.forEach(cafe => {
      const facilityList = cafe.facilities.map(f => f.facility.label).join(', ');
      console.log(`  - ${cafe.name}: ${facilityList || 'No facilities'}`);
    });

    console.log('\n✅ Migration verification complete!');
  } catch (error) {
    console.error('❌ Error verifying migration:');
    console.error(error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.meta) console.error('Meta:', error.meta);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration();
