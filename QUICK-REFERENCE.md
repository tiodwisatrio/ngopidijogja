# Quick Reference Card

## 🚀 Perintah Cepat

### Development (Local MySQL)

```bash
# Switch ke mode development
npm run switch:dev

# Jalankan development server
npm run dev

# Push schema ke MySQL lokal
npx prisma db push

# Seed data awal
npm run seed

# Buka Prisma Studio
npx prisma studio
```

**Server:** http://localhost:3000
**Database:** MySQL @ localhost:3306/wfc-jogja

---

### Production (Vercel PostgreSQL)

```bash
# Switch ke mode production (untuk testing lokal)
npm run switch:prod

# Deploy ke Vercel
git add .
git commit -m "Update message"
git push origin main

# Monitor deployment
# Buka: https://vercel.com/tiodwisatrios-projects/ngopidijogja
```

**Production URL:** https://ngopidijogja.vercel.app
**Database:** PostgreSQL @ Vercel (Prisma Accelerate)

---

### Data Migration

```bash
# Export data (dari database yang sedang aktif)
npm run export:data

# Import data (ke database yang sedang aktif)
npm run import:data
```

**Example: Sync Production → Local**

```bash
# 1. Switch ke production
npm run switch:prod

# 2. Export dari production
npm run export:data

# 3. Switch ke development
npm run switch:dev

# 4. Import ke local
npm run import:data
```

---

## 📋 Workflow Tipikal

### Menambah Fitur Baru

```bash
# 1. Pastikan di mode development
npm run switch:dev

# 2. Jalankan server
npm run dev

# 3. Coding...
# Edit files, add features, etc.

# 4. Test di browser
# http://localhost:3000

# 5. Jika perlu update schema:
npx prisma db push

# 6. Commit perubahan
git add .
git commit -m "feat: tambah fitur X"

# 7. PENTING: Switch ke production sebelum push
npm run switch:prod

# 8. Test build lokal
npm run build

# 9. Jika sukses, push ke GitHub
git push origin main

# 10. Vercel auto-deploy

# 11. Switch kembali ke dev untuk lanjut coding
npm run switch:dev
```

---

### Fix Bug di Production

```bash
# 1. Pull data production untuk reproduce bug
npm run switch:prod
npm run export:data

# 2. Switch ke dev dengan data production
npm run switch:dev
npm run import:data

# 3. Jalankan server dan reproduce bug
npm run dev

# 4. Fix bug...

# 5. Test fix
# http://localhost:3000

# 6. Commit fix
git add .
git commit -m "fix: perbaiki bug X"

# 7. Switch ke prod dan deploy
npm run switch:prod
npm run build  # Test build
git push origin main

# 8. Kembali ke dev
npm run switch:dev
```

---

## 🔧 Database Commands

```bash
# Prisma Studio (GUI untuk manage data)
npx prisma studio

# Generate Prisma Client (setelah edit schema)
npx prisma generate

# Push schema tanpa migration
npx prisma db push

# Reset database (HATI-HATI!)
npx prisma db push --force-reset

# Seed database
npm run seed
```

---

## 📁 File Locations

| Lokasi | Deskripsi |
|--------|-----------|
| `app/` | Next.js App Router pages & API routes |
| `components/` | React components |
| `prisma/schema.prisma` | Database schema |
| `prisma/seed.ts` | Seed data script |
| `scripts/` | Utility scripts (export, import, switch) |
| `public/` | Static files |
| `.env` | Current environment config (GITIGNORED) |
| `.env.mysql` | MySQL config template |
| `.env.postgres` | PostgreSQL config backup |

---

## 🆘 Emergency Commands

### Database Terkorupsi

```bash
# Development (MySQL)
npx prisma db push --force-reset
npm run seed

# Production (JANGAN SEMBARANGAN!)
# Contact admin atau restore dari backup
```

### Build Gagal di Vercel

```bash
# 1. Test build lokal
npm run build

# 2. Cek error di terminal
# Fix error yang muncul

# 3. Pastikan schema = postgresql
cat prisma/schema.prisma | grep provider

# 4. Commit fix
git add .
git commit -m "fix: build error"
git push origin main
```

### Lupa Mode Apa Sekarang

```bash
# Cek provider di schema
cat prisma/schema.prisma | grep provider

# Cek database URL
cat .env | grep DATABASE_URL

# mysql = development
# postgresql = production
```

---

## ⚠️ JANGAN LAKUKAN INI

❌ **Push ke production tanpa test build lokal**
```bash
git push origin main  # TANPA npm run build
```

❌ **Edit data production langsung tanpa backup**
```bash
npm run switch:prod
npx prisma db push --force-reset  # BAHAYA!
```

❌ **Commit file .env ke Git**
```bash
git add .env  # JANGAN!
```

❌ **Jalankan seed di production**
```bash
npm run switch:prod
npm run seed  # AKAN OVERWRITE DATA PRODUCTION!
```

---

## ✅ Best Practices

✓ **Selalu test build sebelum deploy**
```bash
npm run switch:prod
npm run build
```

✓ **Export data production sebelum update schema**
```bash
npm run switch:prod
npm run export:data
# Sekarang ada backup di exports/
```

✓ **Gunakan descriptive commit messages**
```bash
git commit -m "feat: add cafe filter by distance"
git commit -m "fix: opening hours not showing"
git commit -m "refactor: optimize image loading"
```

✓ **Switch kembali ke dev setelah deploy**
```bash
git push origin main
npm run switch:dev
```

---

## 📞 URLs

- **Production:** https://ngopidijogja.vercel.app
- **GitHub:** https://github.com/tiodwisatrio/ngopidijogja
- **Vercel Dashboard:** https://vercel.com/tiodwisatrios-projects/ngopidijogja
- **Vercel Logs:** https://vercel.com/tiodwisatrios-projects/ngopidijogja/logs
