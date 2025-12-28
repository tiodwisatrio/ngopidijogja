const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Switching to DEVELOPMENT mode...\n');

// 1. Backup current .env
if (fs.existsSync('.env')) {
  fs.copyFileSync('.env', '.env.backup');
  console.log('✓ Backed up current .env to .env.backup');
}

// 2. Check if .env.dev.local exists (PostgreSQL Laragon)
if (!fs.existsSync('.env.dev.local')) {
  console.log('❌ .env.dev.local not found! Creating from template...');
  const devEnv = `# PostgreSQL Laragon - Development
DATABASE_URL="postgresql://postgres:Tiodwisatrio123*@localhost:5432/wfcjogja_dev?schema=public"
NEXTAUTH_SECRET="2OW7Pt3Sfx5ZcgpBqsIoF6ALkHYUMTlj"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_dav4OtN3aerPuTjt_Od4XXiomW3dR39fnKh4Ej4yP5IjAxQ"
`;
  fs.writeFileSync('.env.dev.local', devEnv);
}

// 3. Copy .env.dev.local to .env
fs.copyFileSync('.env.dev.local', '.env');
console.log('✓ Copied .env.dev.local to .env');

// 4. Update prisma/schema.prisma (keep PostgreSQL)
const schemaPath = path.join('prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

if (schema.includes('provider = "mysql"')) {
  schema = schema.replace(/provider\s*=\s*"mysql"/, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, schema);
  console.log('✓ Updated prisma/schema.prisma to use PostgreSQL');
} else if (schema.includes('provider = "postgresql"')) {
  console.log('✓ prisma/schema.prisma already using PostgreSQL');
} else {
  console.log('⚠️  Warning: Could not find provider in schema.prisma');
}

// 5. Generate Prisma Client
console.log('\n📦 Generating Prisma Client for PostgreSQL...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✓ Prisma Client generated');
} catch (error) {
  console.log('❌ Failed to generate Prisma Client');
  process.exit(1);
}

console.log('\n✅ Successfully switched to DEVELOPMENT mode!');
console.log('\n📋 Next steps:');
console.log('   1. Make sure PostgreSQL is running on localhost:5432 (Laragon)');
console.log('   2. Run: npx prisma db push (to sync schema)');
console.log('   3. Run: npm run dev');
console.log('\n🗄️  Database: PostgreSQL Local (wfcjogja_dev)');
console.log('🌐 Server: http://localhost:3000\n');
