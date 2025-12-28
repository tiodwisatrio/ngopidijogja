# Development & Production Guide

Panduan lengkap untuk development lokal dan deployment ke production.

---

## 🏠 Development (Local)

### 1. Setup Database Lokal

**Database:** MySQL lokal di `localhost:3306`

```bash
# Database name: wfc-jogja
# Username: root
# Password: (kosong)
```

### 2. Konfigurasi Environment

**File: `.env.local`** (untuk development)

```env
# MySQL Local Database
DATABASE_URL="mysql://root@localhost:3306/wfc-jogja"

# NextAuth Secret (generate dengan: openssl rand -base64 32)
NEXTAUTH_SECRET="2OW7Pt3Sfx5ZcgpBqsIoF6ALkHYUMTlj"

# Vercel Blob (tetap gunakan production untuk upload images)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_dav4OtN3aerPuTjt_Od4XXiomW3dR39fnKh4Ej4yP5IjAxQ"
```

### 3. Ubah Prisma Schema ke MySQL

**File: `prisma/schema.prisma`**

```prisma
datasource db {
  provider = "mysql"  // ← Ubah ke mysql
  url      = env("DATABASE_URL")
}
```

### 4. Jalankan Development Server

```bash
# 1. Install dependencies (jika belum)
npm install

# 2. Generate Prisma Client untuk MySQL
npx prisma generate

# 3. Push schema ke database lokal
npx prisma db push

# 4. (Optional) Seed data awal
npx prisma db seed

# 5. Jalankan dev server
npm run dev
```

Server akan berjalan di: **http://localhost:3000**

### 5. Development Workflow

```bash
# Selalu cek schema provider sebelum development
cat prisma/schema.prisma | grep provider

# Jika masih postgresql, ubah ke mysql
# Edit prisma/schema.prisma line 11:
#   provider = "mysql"

# Generate ulang Prisma Client
npx prisma generate

# Push schema changes
npx prisma db push

# Mulai coding...
npm run dev
```

---

## 🚀 Production (Vercel)

### 1. Setup Database Production

**Database:** PostgreSQL di Vercel (Prisma Accelerate)

- Free tier: 256MB storage
- Managed oleh Vercel

### 2. Konfigurasi Environment (di Vercel Dashboard)

**Lokasi:** https://vercel.com/tiodwisatrios-projects/ngopidijogja/settings/environment-variables

**Variables:**

```
DATABASE_URL="postgresql://cc3a63cef394fda015cfbcb31808841a9e2130e3b1df4692901304fcd1f4e818:sk_HYXTHWqXCTcackIKF_Xmx@db.prisma.io:5432/postgres?sslmode=require"

NEXTAUTH_SECRET="2OW7Pt3Sfx5ZcgpBqsIoF6ALkHYUMTlj"

NEXTAUTH_URL="https://ngopidijogja.vercel.app"

BLOB_READ_WRITE_TOKEN="vercel_blob_rw_dav4OtN3aerPuTjt_Od4XXiomW3dR39fnKh4Ej4yP5IjAxQ"
```

### 3. Ubah Prisma Schema ke PostgreSQL

**File: `prisma/schema.prisma`**

```prisma
datasource db {
  provider = "postgresql"  // ← Ubah ke postgresql
  url      = env("DATABASE_URL")
}
```

### 4. Deploy ke Production

```bash
# 1. Pastikan schema sudah postgresql
cat prisma/schema.prisma | grep provider
# Harus output: provider = "postgresql"

# 2. Commit semua perubahan
git add .
git commit -m "Update feature X"

# 3. Push ke GitHub (Vercel auto-deploy)
git push origin main
```

**Vercel akan otomatis:**
- Detect push ke GitHub
- Build aplikasi
- Deploy ke production
- URL: https://ngopidijogja.vercel.app

### 5. Monitor Deployment

```bash
# Cek status deployment
# Buka: https://vercel.com/tiodwisatrios-projects/ngopidijogja/deployments

# Atau gunakan Vercel CLI
npx vercel --prod
```

---

## 🔄 Sync Data: Local ↔ Production

### Export dari Production ke Local

**Gunakan jika ingin development dengan data production terbaru:**

```bash
# 1. Switch ke PostgreSQL
# Edit .env:
DATABASE_URL="postgresql://..."

# Edit prisma/schema.prisma:
provider = "postgresql"

# 2. Generate Prisma Client
npx prisma generate

# 3. Export data
npx tsx scripts/export-data.ts
# Output: exports/mysql-data-export.json

# 4. Switch kembali ke MySQL
# Edit .env:
DATABASE_URL="mysql://root@localhost:3306/wfc-jogja"

# Edit prisma/schema.prisma:
provider = "mysql"

# 5. Generate Prisma Client
npx prisma generate

# 6. Import data
npx tsx scripts/import-data.ts
```

### Export dari Local ke Production

**Gunakan jika ingin push data lokal ke production:**

```bash
# 1. Export dari MySQL lokal
# Pastikan .env menggunakan MySQL
npx tsx scripts/export-data.ts

# 2. Switch ke PostgreSQL
# Edit .env:
DATABASE_URL="postgresql://..."

# Edit prisma/schema.prisma:
provider = "postgresql"

# 3. Generate Prisma Client
npx prisma generate

# 4. Import ke PostgreSQL
npx tsx scripts/import-data.ts

# 5. Switch kembali ke MySQL untuk development
```

---

## 📋 Checklist Sebelum Deploy

- [ ] **Schema provider = "postgresql"** di `prisma/schema.prisma`
- [ ] **Tidak ada console.log() yang tidak perlu**
- [ ] **Test di local dengan `npm run build`** (harus sukses)
- [ ] **Commit message yang jelas**
- [ ] **Push ke branch `main`**

```bash
# Test build lokal sebelum deploy
npm run build

# Jika sukses, baru deploy
git add .
git commit -m "feat: tambah fitur X"
git push origin main
```

---

## 🛠️ Troubleshooting

### Error: "Provider mismatch"

```bash
# Cek provider saat ini
cat prisma/schema.prisma | grep provider

# Sesuaikan dengan .env
cat .env | grep DATABASE_URL

# Generate ulang
npx prisma generate
```

### Error: "Vercel deployment failed"

```bash
# 1. Cek build error di Vercel dashboard
# 2. Test build lokal:
npm run build

# 3. Pastikan schema.prisma = postgresql
# 4. Force redeploy:
git commit --allow-empty -m "Force redeploy"
git push origin main
```

### Error: "Cannot connect to database"

```bash
# Development (MySQL)
# Pastikan MySQL running di localhost:3306

# Production (PostgreSQL)
# Cek connection string di Vercel dashboard
# Environment Variables > DATABASE_URL
```

---

## 📁 File Penting

| File | Development | Production |
|------|-------------|------------|
| `.env.local` | MySQL connection | **JANGAN COMMIT** |
| `prisma/schema.prisma` | `provider = "mysql"` | `provider = "postgresql"` |
| Prisma Client | Generate untuk MySQL | Auto-generated saat deploy |
| Images | Vercel Blob (shared) | Vercel Blob (shared) |

---

## 🔐 Security Notes

**JANGAN commit file ini ke Git:**

- `.env`
- `.env.local`
- `.env.production`
- `.env.mysql`
- `exports/*.json` (berisi data database)

**Sudah ada di `.gitignore`:**

```gitignore
.env
.env.local
.env.*.local
exports/
```

---

## 💡 Tips

### Quick Switch: Development ↔ Production

**Script helper** (buat file `switch-env.sh`):

```bash
#!/bin/bash

if [ "$1" == "dev" ]; then
    echo "Switching to DEVELOPMENT (MySQL)..."
    cp .env.mysql .env
    sed -i 's/provider = "postgresql"/provider = "mysql"/' prisma/schema.prisma
    npx prisma generate
    echo "✅ Switched to MySQL development"
elif [ "$1" == "prod" ]; then
    echo "Switching to PRODUCTION (PostgreSQL)..."
    cp .env.postgres .env
    sed -i 's/provider = "mysql"/provider = "postgresql"/' prisma/schema.prisma
    npx prisma generate
    echo "✅ Switched to PostgreSQL production"
else
    echo "Usage: ./switch-env.sh [dev|prod]"
fi
```

**Usage:**

```bash
# Switch to development
./switch-env.sh dev

# Switch to production
./switch-env.sh prod
```

---

## 📞 Support

Jika ada masalah:

1. Cek error di Vercel dashboard logs
2. Test build lokal: `npm run build`
3. Pastikan provider sesuai dengan database
4. Force redeploy jika perlu

**Production URL:** https://ngopidijogja.vercel.app
**GitHub Repo:** https://github.com/tiodwisatrio/ngopidijogja
**Vercel Dashboard:** https://vercel.com/tiodwisatrios-projects/ngopidijogja
