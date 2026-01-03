/**
 * Sync data from Vercel Postgres (production) to Laragon (local)
 *
 * This script:
 * 1. Reads all data from production Vercel Postgres
 * 2. Clears local Laragon database
 * 3. Copies all data to local database
 */

import { PrismaClient } from '@prisma/client';

// Production Vercel Postgres database
const cloudPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://cc3a63cef394fda015cfbcb31808841a9e2130e3b1df4692901304fcd1f4e818:sk_HYXTHWqXCTcackIKF_Xmx@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
});

// Local Laragon database
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Tiodwisatrio123*@localhost:5432/wfcjogja_dev?schema=public"
    }
  }
});

async function main() {
  try {
    console.log('🔍 Reading data from Vercel Postgres (production)...');

    // Read all data from production
    const [cloudCafes, cloudPaymentMethods, cloudFacilities, cloudUsers] = await Promise.all([
      cloudPrisma.cafe.findMany({
        include: {
          images: true,
          openingHours: true,
          paymentMethods: true,
          facilities: true,
        }
      }),
      cloudPrisma.paymentMethod.findMany(),
      cloudPrisma.facility.findMany(),
      cloudPrisma.user.findMany(),
    ]);

    console.log(`✅ Found in production:
  - ${cloudCafes.length} cafes
  - ${cloudPaymentMethods.length} payment methods
  - ${cloudFacilities.length} facilities
  - ${cloudUsers.length} users
`);

    console.log('🗑️  Clearing local Laragon database...');

    // Clear local database
    await localPrisma.cafeImage.deleteMany();
    await localPrisma.openingHour.deleteMany();
    await localPrisma.cafePaymentMethod.deleteMany();
    await localPrisma.cafeFacility.deleteMany();
    await localPrisma.cafe.deleteMany();
    await localPrisma.paymentMethod.deleteMany();
    await localPrisma.facility.deleteMany();
    await localPrisma.user.deleteMany();

    console.log('✅ Local database cleared');

    console.log('📥 Copying data to local Laragon...');

    // Copy payment methods
    for (const pm of cloudPaymentMethods) {
      await localPrisma.paymentMethod.create({
        data: {
          id: pm.id,
          code: pm.code,
          label: pm.label,
        }
      });
    }
    console.log(`  ✓ Copied ${cloudPaymentMethods.length} payment methods`);

    // Copy facilities
    for (const facility of cloudFacilities) {
      await localPrisma.facility.create({
        data: {
          id: facility.id,
          code: facility.code,
          label: facility.label,
          icon: facility.icon,
        }
      });
    }
    console.log(`  ✓ Copied ${cloudFacilities.length} facilities`);

    // Copy users
    for (const user of cloudUsers) {
      await localPrisma.user.create({
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
    console.log(`  ✓ Copied ${cloudUsers.length} users`);

    // Copy cafes with relations
    for (const cafe of cloudCafes) {
      // Create cafe
      await localPrisma.cafe.create({
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
        await localPrisma.cafeImage.create({
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
        await localPrisma.openingHour.create({
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
        await localPrisma.cafePaymentMethod.create({
          data: {
            cafeId: pm.cafeId,
            paymentMethodId: pm.paymentMethodId,
          }
        });
      }

      // Copy facilities relation
      for (const facility of cafe.facilities) {
        await localPrisma.cafeFacility.create({
          data: {
            cafeId: facility.cafeId,
            facilityId: facility.facilityId,
          }
        });
      }

      console.log(`  ✓ Copied cafe: ${cafe.name}`);
    }

    console.log(`\n✅ Successfully synced ${cloudCafes.length} cafes from production to local!`);

    // Verify
    const localCount = await localPrisma.cafe.count();
    console.log(`\n🔍 Verification: Local Laragon now has ${localCount} cafes`);

  } catch (error) {
    console.error('❌ Error syncing data:', error);
    throw error;
  } finally {
    await cloudPrisma.$disconnect();
    await localPrisma.$disconnect();
  }
}

main();
