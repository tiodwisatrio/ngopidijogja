import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function importData() {
  console.log('🔄 Starting data import to PostgreSQL...');

  try {
    // Read exported data
    const filename = path.join(process.cwd(), 'exports', 'mysql-data-export.json');

    if (!fs.existsSync(filename)) {
      throw new Error(`Export file not found: ${filename}`);
    }

    const fileContent = fs.readFileSync(filename, 'utf-8');
    const data = JSON.parse(fileContent);

    console.log(`📁 Reading from: ${filename}`);
    console.log(`📅 Exported at: ${data.exportedAt}`);

    // Clear existing data (except admin user)
    console.log('\n🗑️  Clearing existing data...');
    await prisma.cafeFacility.deleteMany({});
    await prisma.cafePaymentMethod.deleteMany({});
    await prisma.cafeImage.deleteMany({});
    await prisma.openingHour.deleteMany({});
    await prisma.cafe.deleteMany({});
    // Don't delete payment methods and facilities - they might be referenced

    // Import Payment Methods
    console.log('\n💳 Importing payment methods...');
    const paymentMethodMap = new Map<number, number>();
    for (const pm of data.paymentMethods) {
      const oldId = pm.id;
      const existing = await prisma.paymentMethod.findFirst({
        where: { code: pm.code },
      });

      if (existing) {
        paymentMethodMap.set(oldId, existing.id);
        console.log(`   ✓ Payment method "${pm.label}" already exists`);
      } else {
        const newPm = await prisma.paymentMethod.create({
          data: {
            code: pm.code,
            label: pm.label,
          },
        });
        paymentMethodMap.set(oldId, newPm.id);
        console.log(`   ✓ Created payment method: ${pm.label}`);
      }
    }

    // Import Facilities
    console.log('\n🏢 Importing facilities...');
    const facilityMap = new Map<number, number>();
    for (const facility of data.facilities) {
      const oldId = facility.id;
      const existing = await prisma.facility.findFirst({
        where: { code: facility.code },
      });

      if (existing) {
        facilityMap.set(oldId, existing.id);
        console.log(`   ✓ Facility "${facility.label}" already exists`);
      } else {
        const newFacility = await prisma.facility.create({
          data: {
            code: facility.code,
            label: facility.label,
            icon: facility.icon,
          },
        });
        facilityMap.set(oldId, newFacility.id);
        console.log(`   ✓ Created facility: ${facility.label}`);
      }
    }

    // Import Cafes
    console.log('\n☕ Importing cafes...');
    const cafeMap = new Map<number, number>();

    for (const cafe of data.cafes) {
      const oldId = cafe.id;

      // Create cafe
      const newCafe = await prisma.cafe.create({
        data: {
          slug: cafe.slug,
          name: cafe.name,
          address: cafe.address,
          latitude: cafe.latitude,
          longitude: cafe.longitude,
          googleMapsUrl: cafe.googleMapsUrl,
          instagramUrl: cafe.instagramUrl,
          instagramUsername: cafe.instagramUsername,
          parking: cafe.parking,
          priceMin: cafe.priceMin,
          priceMax: cafe.priceMax,
          priceRange: cafe.priceRange,
        },
      });

      cafeMap.set(oldId, newCafe.id);
      console.log(`   ✓ Created cafe: ${cafe.name}`);

      // Import opening hours
      for (const oh of cafe.openingHours) {
        await prisma.openingHour.create({
          data: {
            cafeId: newCafe.id,
            dayOfWeek: oh.dayOfWeek,
            openTime: new Date(oh.openTime),
            closeTime: new Date(oh.closeTime),
            isClosed: oh.isClosed,
            isOpen24Hours: oh.isOpen24Hours,
            isEverydayOpen: oh.isEverydayOpen,
          },
        });
      }

      // Import payment methods
      for (const pm of cafe.paymentMethods) {
        const newPaymentMethodId = paymentMethodMap.get(pm.paymentMethodId);
        if (newPaymentMethodId) {
          await prisma.cafePaymentMethod.create({
            data: {
              cafeId: newCafe.id,
              paymentMethodId: newPaymentMethodId,
            },
          });
        }
      }

      // Import facilities
      for (const fac of cafe.facilities) {
        const newFacilityId = facilityMap.get(fac.facilityId);
        if (newFacilityId) {
          await prisma.cafeFacility.create({
            data: {
              cafeId: newCafe.id,
              facilityId: newFacilityId,
            },
          });
        }
      }

      // Import images
      for (const img of cafe.images) {
        await prisma.cafeImage.create({
          data: {
            cafeId: newCafe.id,
            imageUrl: img.imageUrl,
            alt: img.alt,
          },
        });
      }
    }

    // Import Users (preserve existing admin)
    console.log('\n👤 Importing users...');
    for (const user of data.users) {
      const existing = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existing) {
        console.log(`   ✓ User "${user.email}" already exists`);
      } else {
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            role: user.role,
          },
        });
        console.log(`   ✓ Created user: ${user.email}`);
      }
    }

    console.log('\n✅ Import completed successfully!');
    console.log(`\n📊 Import summary:`);
    console.log(`   - Cafes: ${data.cafes.length}`);
    console.log(`   - Payment Methods: ${data.paymentMethods.length}`);
    console.log(`   - Facilities: ${data.facilities.length}`);
    console.log(`   - Users: ${data.users.length}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importData();
