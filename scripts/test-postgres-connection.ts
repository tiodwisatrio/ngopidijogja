import { PrismaClient } from '@prisma/client';

// Temporarily override DATABASE_URL for testing
const testDatabaseUrl = 'postgresql://postgres:Tiodwisatrio123*@localhost:5432/postgres?schema=public';

async function testConnection() {
  console.log('🔌 Testing PostgreSQL connection...\n');
  console.log('Connection string:', testDatabaseUrl);
  console.log('');

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: testDatabaseUrl,
      },
    },
  });

  try {
    // Test query
    await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Connection successful!');
    console.log('');

    // List existing databases
    const databases = await prisma.$queryRaw<Array<{ datname: string }>>`
      SELECT datname FROM pg_database
      WHERE datistemplate = false
      ORDER BY datname;
    `;

    console.log('📊 Available databases:');
    databases.forEach((db) => {
      console.log(`   - ${db.datname}`);
    });
    console.log('');

    // Check if wfcjogja_dev exists
    const devDbExists = databases.some((db) => db.datname === 'wfcjogja_dev');

    if (devDbExists) {
      console.log('✅ Database "wfcjogja_dev" already exists!');
    } else {
      console.log('⚠️  Database "wfcjogja_dev" not found.');
      console.log('');
      console.log('📝 To create it, run:');
      console.log('   npm run create:devdb');
      console.log('   Or manually: createdb -U postgres wfcjogja_dev');
    }
  } catch (error: any) {
    console.error('❌ Connection failed!');
    console.error('');
    console.error('Error:', error.message);
    console.error('');

    if (error.message.includes('password authentication failed')) {
      console.log('💡 Solution: PostgreSQL memerlukan password.');
      console.log('   Update .env.dev.local dengan password yang benar:');
      console.log('   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/wfcjogja_dev?schema=public"');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Solution: PostgreSQL tidak running.');
      console.log('   Start Laragon PostgreSQL service.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
