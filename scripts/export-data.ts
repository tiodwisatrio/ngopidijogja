import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function exportData() {
  console.log('🔄 Starting data export from MySQL...');

  try {
    // Export all data
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

    const paymentMethods = await prisma.paymentMethod.findMany();
    const facilities = await prisma.facility.findMany();
    const users = await prisma.user.findMany();

    const data = {
      cafes,
      paymentMethods,
      facilities,
      users,
      exportedAt: new Date().toISOString(),
    };

    // Create exports directory if it doesn't exist
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }

    // Write to file
    const filename = path.join(exportsDir, 'mysql-data-export.json');
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));

    console.log('✅ Export completed successfully!');
    console.log(`📁 File saved to: ${filename}`);
    console.log(`\n📊 Export summary:`);
    console.log(`   - Cafes: ${cafes.length}`);
    console.log(`   - Payment Methods: ${paymentMethods.length}`);
    console.log(`   - Facilities: ${facilities.length}`);
    console.log(`   - Users: ${users.length}`);
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
