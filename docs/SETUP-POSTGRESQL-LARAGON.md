# 🐘 Setup PostgreSQL Laragon untuk Development

Guide untuk setup development environment dengan PostgreSQL Laragon.

---

## ✅ Sudah Selesai

Jika Anda mengikuti langkah-langkah sebelumnya, setup sudah completed!

### Yang Sudah Dikonfigurasi:

1. ✅ **PostgreSQL Laragon** running di `localhost:5432`
2. ✅ **Database `wfcjogja_dev`** sudah dibuat
3. ✅ **Schema Prisma** sudah di-push
4. ✅ **Data production** (21 cafes) sudah di-import ke development
5. ✅ **Script `switch:dev`** sudah update untuk PostgreSQL

---

## 🚀 Quick Start

```bash
# Switch ke development mode
npm run switch:dev

# Jalankan development server
npm run dev

# Buka browser: http://localhost:3000
```

---

## 📋 Credentials PostgreSQL Laragon

**File:** `.env.dev.local` (GITIGNORED - tidak di-commit)

```env
DATABASE_URL="postgresql://postgres:Tiodwisatrio123*@localhost:5432/wfcjogja_dev?schema=public"
NEXTAUTH_SECRET="2OW7Pt3Sfx5ZcgpBqsIoF6ALkHYUMTlj"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_dav4OtN3aerPuTjt_Od4XXiomW3dR39fnKh4Ej4yP5IjAxQ"
```

⚠️ **PENTING:** File ini sudah otomatis dibuat oleh script `switch:dev`. Jika hilang, jalankan:

```bash
npm run switch:dev
```

---

## 🗄️ Database Info

| Item | Value |
|------|-------|
| **Type** | PostgreSQL 17 |
| **Host** | localhost |
| **Port** | 5432 |
| **Database** | wfcjogja_dev |
| **Username** | postgres |
| **Password** | Tiodwisatrio123* |
| **Schema** | public |

---

## 🔄 Workflow Development

### Development (Setiap Hari)

```bash
# 1. Pastikan Laragon running
# Buka Laragon → Start All

# 2. Switch ke development
npm run switch:dev

# 3. Coding...
npm run dev

# 4. Edit files, test di localhost:3000
```

### Deploy ke Production

```bash
# 1. Switch ke production untuk test
npm run switch:prod

# 2. Test build lokal
npm run build

# 3. Jika sukses, commit & push
git add .
git commit -m "feat: fitur baru"
git push origin main

# 4. Vercel auto-deploy

# 5. Switch kembali ke dev
npm run switch:dev
```

---

## 🔄 Sync Data Production → Development

Jika ingin development dengan data production terbaru:

```bash
# 1. Switch ke production
npm run switch:prod

# 2. Export data dari production
npm run export:data

# 3. Switch ke development
npm run switch:dev

# 4. Import data ke development
npm run import:data

# ✅ Sekarang dev punya data yang sama dengan production
```

---

## 🛠️ Useful Commands

```bash
# Prisma Studio (GUI untuk manage data)
npx prisma studio

# Generate Prisma Client (setelah edit schema)
npx prisma generate

# Push schema ke database (tanpa migration)
npx prisma db push

# Reset database (HATI-HATI! Semua data hilang)
npx prisma db push --force-reset

# Test PostgreSQL connection
npx tsx scripts/test-postgres-connection.ts

# Create database baru
npx tsx scripts/create-dev-database.ts
```

---

## 📊 Database Management via pgAdmin

Laragon biasanya sudah include **pgAdmin 4** (GUI tool untuk PostgreSQL).

### Cara Akses:

1. **Start Menu** → **pgAdmin 4**
2. Klik **Add New Server**
3. **General Tab:**
   - Name: `Laragon PostgreSQL`
4. **Connection Tab:**
   - Host: `localhost`
   - Port: `5432`
   - Maintenance database: `postgres`
   - Username: `postgres`
   - Password: `Tiodwisatrio123*`
5. **Save**

Sekarang Anda bisa:
- View tables
- Run SQL queries
- Export/import data
- Monitor queries

---

## 🔍 Troubleshooting

### Error: "port 5432 already in use"

**Penyebab:** PostgreSQL dari instalasi lain conflict dengan Laragon.

**Solusi:**
1. Stop PostgreSQL service lain via Services (`services.msc`)
2. Atau ubah port Laragon PostgreSQL di config

### Error: "password authentication failed"

**Penyebab:** Password salah atau berubah.

**Solusi:**
1. Cek password di Laragon → PostgreSQL → Summary
2. Update `.env.dev.local` dengan password yang benar
3. Jalankan `npm run switch:dev` lagi

### Error: "database wfcjogja_dev does not exist"

**Solusi:**
```bash
npx tsx scripts/create-dev-database.ts
```

### Error: "Prisma Client not generated"

**Solusi:**
```bash
npx prisma generate
```

### Dev server stuck / slow

**Solusi:**
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

---

## 🎯 Keuntungan Setup Ini

### ✅ Development & Production Konsisten

- **Development:** PostgreSQL local (Laragon)
- **Production:** PostgreSQL Vercel
- **Tidak ada perbedaan** MySQL vs PostgreSQL
- **Testing lebih akurat**

### ✅ Isolated & Safe

- Development database terpisah dari production
- Bisa testing destructive operations tanpa takut
- Reset database kapan saja tanpa risiko

### ✅ Fast & Easy

- Laragon start/stop dengan 1 klik
- No manual PostgreSQL installation needed
- Auto-configure dengan `switch:dev`

---

## 📝 Notes

### File yang JANGAN Di-commit

- `.env`
- `.env.local`
- `.env.dev.local`
- `.env.backup`
- `exports/*.json`

Semua sudah di-ignore di `.gitignore`.

### Backup Data Development

Jika mau backup data development sebelum reset:

```bash
# Export data development
npm run export:data

# File saved to: exports/mysql-data-export.json
# Simpan file ini untuk restore nanti
```

### Clone Project di Komputer Lain

```bash
# 1. Clone repo
git clone https://github.com/tiodwisatrio/ngopidijogja.git
cd ngopidijogja

# 2. Install dependencies
npm install

# 3. Pastikan Laragon PostgreSQL running

# 4. Switch ke dev (akan auto-create .env.dev.local)
npm run switch:dev

# 5. Create database
npx tsx scripts/create-dev-database.ts

# 6. Push schema
npx prisma db push

# 7. Import data (jika punya export file)
npm run import:data

# 8. Jalankan dev server
npm run dev
```

---

## 🚀 Next Steps

Sekarang Anda siap development dengan PostgreSQL!

```bash
npm run dev
```

Buka: **http://localhost:3000**

Happy coding! ☕✨
