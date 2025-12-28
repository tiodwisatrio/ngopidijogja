import { PrismaClient } from '@prisma/client';

const adminDbUrl = 'postgresql://postgres:Tiodwisatrio123*@localhost:5432/postgres?schema=public';

async function createDevDatabase() {
  console.log('📦 Creating development database...\n');

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: adminDbUrl,
      },
    },
  });

  try {
    // Check if database exists
    const databases = await prisma.$queryRaw<Array<{ datname: string }>>`
      SELECT datname FROM pg_database
      WHERE datname = 'wfcjogja_dev';
    `;

    if (databases.length > 0) {
      console.log('✅ Database "wfcjogja_dev" already exists!');
    } else {
      // Create database
      await prisma.$executeRawUnsafe('CREATE DATABASE wfcjogja_dev;');
      console.log('✅ Database "wfcjogja_dev" created successfully!');
    }

    console.log('\n📋 Next steps:');
    console.log('   1. Update .env with dev database URL');
    console.log('   2. Run: npx prisma db push');
    console.log('   3. Run: npm run seed (optional)');
    console.log('   4. Run: npm run dev');
  } catch (error: any) {
    console.error('❌ Failed to create database!');
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createDevDatabase();
