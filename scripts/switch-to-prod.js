const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Switching to PRODUCTION mode...\n');

// 1. Backup current .env
if (fs.existsSync('.env')) {
  fs.copyFileSync('.env', '.env.backup');
  console.log('✓ Backed up current .env to .env.backup');
}

// 2. Check if .env.postgres exists
if (!fs.existsSync('.env.postgres')) {
  console.log('⚠️  .env.postgres not found! Using .env.local...');
  if (fs.existsSync('.env.local')) {
    fs.copyFileSync('.env.local', '.env.postgres');
  } else {
    console.log('❌ Neither .env.postgres nor .env.local found!');
    console.log('   Please create .env.postgres with PostgreSQL connection string');
    process.exit(1);
  }
}

// 3. Copy .env.postgres to .env
fs.copyFileSync('.env.postgres', '.env');
console.log('✓ Copied .env.postgres to .env');

// 4. Update prisma/schema.prisma
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

console.log('\n✅ Successfully switched to PRODUCTION mode!');
console.log('\n⚠️  REMINDER: This is for TESTING production config locally');
console.log('   DO NOT run migrations or seeds against production database!');
console.log('\n📋 To deploy to Vercel:');
console.log('   1. git add .');
console.log('   2. git commit -m "Your message"');
console.log('   3. git push origin main');
console.log('\n🗄️  Database: PostgreSQL (Vercel)');
console.log('🌐 Production: https://ngopidijogja.vercel.app\n');
