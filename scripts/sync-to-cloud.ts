/**
 * Sync data from Laragon (local) to Prisma Cloud (production)
 *
 * This script:
 * 1. Reads all data from local Laragon database
 * 2. Clears production database
 * 3. Copies all data to production database
 */

import { PrismaClient } from '@prisma/client';

// Local Laragon database
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Tiodwisatrio123*@localhost:5432/wfcjogja_dev?schema=public"
    }
  }
});

// Production Prisma Cloud database
const cloudPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://cc3a63cef394fda015cfbcb31808841a9e2130e3b1df4692901304fcd1f4e818:sk_HYXTHWqXCTcackIKF_Xmx@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
});

async function main() {
  try {
    console.log('🔍 Reading data from Laragon database...');

    // Read all data from local
    const [localCafes, localPaymentMethods, localFacilities, localUsers] = await Promise.all([
      localPrisma.cafe.findMany({
        include: {
          images: true,
          openingHours: true,
          paymentMethods: true,
          facilities: true,
        }
      }),
      localPrisma.paymentMethod.findMany(),
      localPrisma.facility.findMany(),
      localPrisma.user.findMany(),
    ]);

    console.log(`✅ Found in Laragon:
  - ${localCafes.length} cafes
  - ${localPaymentMethods.length} payment methods
  - ${localFacilities.length} facilities
  - ${localUsers.length} users
`);

    console.log('🗑️  Clearing Prisma Cloud database...');

    // Clear cloud database (in correct order due to foreign keys)
    await cloudPrisma.cafeImage.deleteMany();
    await cloudPrisma.openingHour.deleteMany();
    await cloudPrisma.cafePaymentMethod.deleteMany();
    await cloudPrisma.cafeFacility.deleteMany();
    await cloudPrisma.cafe.deleteMany();
    await cloudPrisma.paymentMethod.deleteMany();
    await cloudPrisma.facility.deleteMany();
    await cloudPrisma.user.deleteMany();

    console.log('✅ Cloud database cleared');

    console.log('📤 Copying data to Prisma Cloud...');

    // Copy payment methods first
    for (const pm of localPaymentMethods) {
      await cloudPrisma.paymentMethod.create({
        data: {
          id: pm.id,
          code: pm.code,
          label: pm.label,
        }
      });
    }
    console.log(`  ✓ Copied ${localPaymentMethods.length} payment methods`);

    // Copy facilities
    for (const facility of localFacilities) {
      await cloudPrisma.facility.create({
        data: {
          id: facility.id,
          code: facility.code,
          label: facility.label,
          icon: facility.icon,
        }
      });
    }
    console.log(`  ✓ Copied ${localFacilities.length} facilities`);

    // Copy users
    for (const user of localUsers) {
      await cloudPrisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          password: user.password,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      });
    }
    console.log(`  ✓ Copied ${localUsers.length} users`);

    // Copy cafes with relations
    for (const cafe of localCafes) {
      // Create cafe first
      await cloudPrisma.cafe.create({
        data: {
          id: cafe.id,
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
          mainImageId: cafe.mainImageId,
          createdAt: cafe.createdAt,
          updatedAt: cafe.updatedAt,
        }
      });

      // Copy images
      for (const image of cafe.images) {
        await cloudPrisma.cafeImage.create({
          data: {
            id: image.id,
            cafeId: image.cafeId,
            imageUrl: image.imageUrl,
            alt: image.alt,
            createdAt: image.createdAt,
          }
        });
      }

      // Copy opening hours
      for (const hours of cafe.openingHours) {
        await cloudPrisma.openingHour.create({
          data: {
            id: hours.id,
            cafeId: hours.cafeId,
            dayOfWeek: hours.dayOfWeek,
            openTime: hours.openTime,
            closeTime: hours.closeTime,
            isClosed: hours.isClosed,
            isEverydayOpen: hours.isEverydayOpen,
            isOpen24Hours: hours.isOpen24Hours,
          }
        });
      }

      // Copy payment methods relation
      for (const pm of cafe.paymentMethods) {
        await cloudPrisma.cafePaymentMethod.create({
          data: {
            cafeId: pm.cafeId,
            paymentMethodId: pm.paymentMethodId,
          }
        });
      }

      // Copy facilities relation
      for (const facility of cafe.facilities) {
        await cloudPrisma.cafeFacility.create({
          data: {
            cafeId: facility.cafeId,
            facilityId: facility.facilityId,
          }
        });
      }

      console.log(`  ✓ Copied cafe: ${cafe.name}`);
    }

    console.log(`\n✅ Successfully synced ${localCafes.length} cafes to Prisma Cloud!`);

    // Verify
    const cloudCount = await cloudPrisma.cafe.count();
    console.log(`\n🔍 Verification: Prisma Cloud now has ${cloudCount} cafes`);

  } catch (error) {
    console.error('❌ Error syncing data:', error);
    throw error;
  } finally {
    await localPrisma.$disconnect();
    await cloudPrisma.$disconnect();
  }
}

main();
