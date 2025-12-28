const { PrismaClient } = require('@prisma/client');

async function insertCafeFacilities() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Getting cafe IDs and facility IDs...');

    // Get the first cafe (Blanco Coffee & Books)
    const blanco = await prisma.cafe.findFirst({
      where: { slug: 'blanco-coffee-books' }
    });

    if (!blanco) {
      console.log('❌ Blanco Coffee & Books not found');
      return;
    }

    console.log(`✅ Found cafe: ${blanco.name} (ID: ${blanco.id})`);

    // Get facility IDs
    const wifi = await prisma.facility.findUnique({ where: { code: 'wifi' } });
    const toilet = await prisma.facility.findUnique({ where: { code: 'toilet' } });
    const mushola = await prisma.facility.findUnique({ where: { code: 'mushola' } });

    console.log(`✅ Found facilities: wifi(${wifi.id}), toilet(${toilet.id}), mushola(${mushola.id})`);

    // Insert cafe facilities
    console.log('\n📝 Inserting cafe facilities...');

    await prisma.cafeFacility.createMany({
      data: [
        { cafeId: blanco.id, facilityId: wifi.id },
        { cafeId: blanco.id, facilityId: toilet.id },
        { cafeId: blanco.id, facilityId: mushola.id },
      ],
      skipDuplicates: true
    });

    console.log('✅ Successfully inserted cafe facilities!');

    // Verify
    const cafeWithFacilities = await prisma.cafe.findUnique({
      where: { id: blanco.id },
      include: {
        facilities: {
          include: {
            facility: true
          }
        }
      }
    });

    console.log(`\n🎉 ${cafeWithFacilities.name} now has ${cafeWithFacilities.facilities.length} facilities:`);
    cafeWithFacilities.facilities.forEach(f =>
      console.log(`  - ${f.facility.icon} ${f.facility.label}`)
    );

  } catch (error) {
    console.error('❌ Error inserting cafe facilities:');
    console.error(error.message);
    if (error.code) console.error('Error code:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

insertCafeFacilities();
