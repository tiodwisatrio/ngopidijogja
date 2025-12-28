const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Switching to DEVELOPMENT mode...\n');

// 1. Backup current .env
if (fs.existsSync('.env')) {
  fs.copyFileSync('.env', '.env.backup');
  console.log('✓ Backed up current .env to .env.backup');
}

// 2. Check if .env.mysql exists
if (!fs.existsSync('.env.mysql')) {
  console.log('❌ .env.mysql not found! Creating from template...');
  const mysqlEnv = `# MySQL Local - for development
DATABASE_URL="mysql://root@localhost:3306/wfc-jogja"
NEXTAUTH_SECRET="2OW7Pt3Sfx5ZcgpBqsIoF6ALkHYUMTlj"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_dav4OtN3aerPuTjt_Od4XXiomW3dR39fnKh4Ej4yP5IjAxQ"
`;
  fs.writeFileSync('.env.mysql', mysqlEnv);
}

// 3. Copy .env.mysql to .env
fs.copyFileSync('.env.mysql', '.env');
console.log('✓ Copied .env.mysql to .env');

// 4. Update prisma/schema.prisma
const schemaPath = path.join('prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

if (schema.includes('provider = "postgresql"')) {
  schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "mysql"');
  fs.writeFileSync(schemaPath, schema);
  console.log('✓ Updated prisma/schema.prisma to use MySQL');
} else if (schema.includes('provider = "mysql"')) {
  console.log('✓ prisma/schema.prisma already using MySQL');
} else {
  console.log('⚠️  Warning: Could not find provider in schema.prisma');
}

// 5. Generate Prisma Client
console.log('\n📦 Generating Prisma Client for MySQL...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✓ Prisma Client generated');
} catch (error) {
  console.log('❌ Failed to generate Prisma Client');
  process.exit(1);
}

console.log('\n✅ Successfully switched to DEVELOPMENT mode!');
console.log('\n📋 Next steps:');
console.log('   1. Make sure MySQL is running on localhost:3306');
console.log('   2. Run: npx prisma db push (to sync schema)');
console.log('   3. Run: npm run dev');
console.log('\n🗄️  Database: MySQL (wfc-jogja)');
console.log('🌐 Server: http://localhost:3000\n');
