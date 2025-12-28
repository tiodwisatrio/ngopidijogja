# 🐘 Panduan Install PostgreSQL di Windows

## Step 1: Download Installer

1. Buka browser, kunjungi: https://www.postgresql.org/download/windows/
2. Klik **"Download the installer"**
3. Pilih **PostgreSQL 17** untuk Windows x86-64
4. File yang didownload: `postgresql-17.x-windows-x64.exe` (~350MB)

---

## Step 2: Jalankan Installer

1. **Double-click** file installer yang sudah didownload
2. Klik **"Yes"** jika ada UAC prompt (User Account Control)

---

## Step 3: Installation Wizard

### 3.1 Welcome Screen
- Klik **"Next"**

### 3.2 Installation Directory
- **Default:** `C:\Program Files\PostgreSQL\17`
- **Rekomendasi:** Biarkan default
- Klik **"Next"**

### 3.3 Select Components
Pastikan semua component tercentang:
- ✅ **PostgreSQL Server** (wajib)
- ✅ **pgAdmin 4** (GUI tool untuk manage database)
- ✅ **Stack Builder** (optional, bisa di-uncheck)
- ✅ **Command Line Tools** (wajib untuk development)

Klik **"Next"**

### 3.4 Data Directory
- **Default:** `C:\Program Files\PostgreSQL\17\data`
- **Rekomendasi:** Biarkan default
- Klik **"Next"**

### 3.5 Password (PENTING!)
- **Masukkan password untuk user `postgres`**
- **CATAT PASSWORD INI!** Anda akan butuh untuk development

**Rekomendasi password untuk development local:**
```
Password: postgres123
```
(Simple untuk development, JANGAN pakai di production!)

- Konfirmasi password (ketik ulang)
- Klik **"Next"**

### 3.6 Port
- **Default:** `5432`
- **Rekomendasi:** Biarkan default (5432)
- Klik **"Next"**

### 3.7 Locale
- **Default:** `[Default locale]`
- **Rekomendasi:** Biarkan default
- Klik **"Next"**

### 3.8 Summary
- Review semua setting
- Klik **"Next"** untuk mulai install

### 3.9 Installation Progress
- Tunggu proses instalasi (~5-10 menit)
- Jangan close window saat installing

### 3.10 Completing Setup
- **UNCHECK** "Stack Builder" (tidak diperlukan)
- Klik **"Finish"**

---

## Step 4: Verifikasi Instalasi

### 4.1 Cek PostgreSQL Service

1. Tekan **Windows + R**
2. Ketik: `services.msc`
3. Cari service: **postgresql-x64-17**
4. Status harus: **Running**

### 4.2 Test Connection via Command Line

1. Buka **Command Prompt** atau **Git Bash**
2. Test command:

```bash
# Cek versi PostgreSQL
psql --version

# Output yang diharapkan:
# psql (PostgreSQL) 17.x
```

Jika muncul error "command not found", lanjut ke **Step 5: Add to PATH**

---

## Step 5: Add PostgreSQL to PATH (Jika Belum)

### Cara 1: Otomatis (Recommended)

Buka **Command Prompt as Administrator**, jalankan:

```cmd
setx PATH "%PATH%;C:\Program Files\PostgreSQL\17\bin" /M
```

### Cara 2: Manual

1. Tekan **Windows + R**
2. Ketik: `sysdm.cpl`
3. Tab **"Advanced"** → **"Environment Variables"**
4. Pada **"System variables"**, pilih **"Path"** → **"Edit"**
5. Klik **"New"**
6. Tambahkan: `C:\Program Files\PostgreSQL\17\bin`
7. Klik **"OK"** pada semua dialog

### Verifikasi PATH

1. **TUTUP** semua Command Prompt/Git Bash
2. **BUKA BARU** Command Prompt/Git Bash
3. Test:

```bash
psql --version
```

✅ Jika muncul versi PostgreSQL, PATH sudah benar!

---

## Step 6: Test Connection ke Database

```bash
# Connect sebagai superuser 'postgres'
psql -U postgres

# Masukkan password yang Anda set saat instalasi
# Password: postgres123

# Jika berhasil, Anda akan masuk ke PostgreSQL prompt:
# postgres=#
```

### Test Query

```sql
-- Cek versi
SELECT version();

-- Lihat semua database
\l

-- Keluar dari psql
\q
```

---

## Step 7: Buat Database untuk Development

```bash
# Connect ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE wfcjogja_dev;

# Keluar
\q
```

---

## Step 8: Update Project Configuration

### 8.1 Create `.env.dev.local`

Buat file baru: `.env.dev.local`

```env
# PostgreSQL Local - Development
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/wfcjogja_dev?schema=public"

# NextAuth Secret
NEXTAUTH_SECRET="2OW7Pt3Sfx5ZcgpBqsIoF6ALkHYUMTlj"

# Vercel Blob (tetap gunakan production untuk upload images)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_dav4OtN3aerPuTjt_Od4XXiomW3dR39fnKh4Ej4yP5IjAxQ"
```

**Note:** Ganti `postgres123` dengan password Anda jika berbeda.

### 8.2 Update Schema Prisma

Pastikan `prisma/schema.prisma` menggunakan `postgresql`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 8.3 Generate Prisma Client

```bash
npx prisma generate
```

### 8.4 Push Schema ke Database

```bash
npx prisma db push
```

✅ Jika tidak ada error, instalasi berhasil!

---

## Step 9: (Optional) Install pgAdmin 4

pgAdmin 4 sudah terinstall bersama PostgreSQL. Ini GUI tool untuk manage database.

### Cara Membuka:

1. **Start Menu** → **PostgreSQL 17** → **pgAdmin 4**
2. Set master password (untuk pgAdmin, bukan database)
3. Expand: **Servers** → **PostgreSQL 17**
4. Masukkan password postgres
5. Sekarang Anda bisa manage database via GUI

---

## Troubleshooting

### Error: "psql: command not found"

**Solusi:** PATH belum di-set. Ulangi **Step 5**.

### Error: "password authentication failed"

**Solusi:** Password salah. Coba reset:

```bash
# Edit pg_hba.conf
# Location: C:\Program Files\PostgreSQL\17\data\pg_hba.conf
# Ubah method dari "md5" ke "trust" untuk local
# Restart PostgreSQL service
# Connect tanpa password
# Set password baru:
ALTER USER postgres PASSWORD 'new_password';
# Ubah kembali pg_hba.conf ke "md5"
# Restart service
```

### Error: "port 5432 already in use"

**Solusi:** Ada service lain yang pakai port 5432.

```bash
# Cek process yang pakai port 5432
netstat -ano | findstr :5432

# Kill process atau ubah port PostgreSQL di postgresql.conf
```

### Service tidak running

**Solusi:**

```cmd
# Start service manually
net start postgresql-x64-17

# Atau via Services:
# Windows + R → services.msc
# Cari "postgresql-x64-17" → Right click → Start
```

---

## Next Steps

Setelah PostgreSQL terinstall:

1. ✅ Verifikasi `psql --version` works
2. ✅ Database `wfcjogja_dev` sudah dibuat
3. ✅ `.env.dev.local` sudah dikonfigurasi
4. ✅ Prisma schema sudah di-push

**Lanjut ke development:**

```bash
# Copy .env.dev.local ke .env
cp .env.dev.local .env

# Generate Prisma Client
npx prisma generate

# Push schema
npx prisma db push

# (Optional) Seed data
npm run seed

# Jalankan dev server
npm run dev
```

---

## Uninstall (Jika Diperlukan)

1. **Control Panel** → **Programs and Features**
2. Cari **PostgreSQL 17**
3. Klik **Uninstall**
4. Ikuti wizard
5. Hapus folder:
   - `C:\Program Files\PostgreSQL\17`
   - `C:\Users\<YourName>\AppData\Roaming\pgAdmin`

---

## Summary

✅ **PostgreSQL 17 installed**
✅ **Service running on port 5432**
✅ **Database `wfcjogja_dev` created**
✅ **Command line tools available**
✅ **pgAdmin 4 GUI ready**
✅ **Project configured for PostgreSQL**

**Selamat development!** 🎉
