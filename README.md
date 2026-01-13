# ☕ Work From Cafe Jogja

Platform untuk menemukan cafe di Yogyakarta yang cocok untuk bekerja, belajar, atau sekedar ngopi sambil nugas.

**Live Demo:** https://ngopidijogja.vercel.app

---

## Features

- 🗺️ **Interactive Map** - Peta interaktif dengan Leaflet & OpenStreetMap
- 📍 **Location-Based Search** - Cari cafe terdekat dari lokasi Anda
- 🔍 **Advanced Filters** - Filter berdasarkan fasilitas (Wi-Fi, Colokan, Toilet, dll)
- 💼 **WFC-Friendly Badge** - Identifikasi cafe yang punya Wi-Fi + Colokan + Toilet
- ⏰ **Real-time Operating Hours** - Status buka/tutup real-time
- 📱 **Responsive Design** - Mobile-first, optimized untuk semua device
- 🖼️ **Image Gallery** - Swipe gallery dengan lightbox view
- 💳 **Payment Methods** - Info metode pembayaran (Cash, QRIS, E-wallet)
- 🅿️ **Parking Info** - Info parkir motor/mobil

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Leaflet** - Interactive maps
- **Next Image** - Optimized image loading

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database client
- **NextAuth.js** - Authentication
- **Vercel Blob** - Image storage

### Database
- **Development:** MySQL 8.0 (localhost)
- **Production:** PostgreSQL (Vercel)

### Deployment
- **Vercel** - All-in-one platform (hosting + database + blob storage)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0 (untuk development)
- Git

### Installation

```bash
# 1. Clone repository
git clone https://github.com/tiodwisatrio/ngopidijogja.git
cd ngopidijogja

# 2. Install dependencies
npm install

# 3. Switch ke development mode (MySQL)
npm run switch:dev

# 4. Push schema ke database
npx prisma db push

# 5. (Optional) Seed data awal
npm run seed

# 6. Jalankan development server
npm run dev
```

Server akan berjalan di: **http://localhost:3000**

---

## Documentation

Untuk panduan lengkap development dan deployment, baca:

- **[DEVELOPMENT-GUIDE.md](DEVELOPMENT-GUIDE.md)** - Panduan lengkap development & production workflow
- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - Quick reference card untuk perintah-perintah penting

### Perintah Penting

```bash
# Switch environment
npm run switch:dev    # Switch ke MySQL (development)
npm run switch:prod   # Switch ke PostgreSQL (production testing)

# Development
npm run dev           # Jalankan dev server
npm run build         # Build untuk production
npm run seed          # Seed database

# Database
npx prisma studio     # Buka Prisma Studio GUI
npx prisma db push    # Push schema ke database

# Data migration
npm run export:data   # Export database ke JSON
npm run import:data   # Import dari JSON ke database
```

---

## Project Structure

```
wfcjogja/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin panel
│   └── page.tsx           # Main homepage
├── components/            # React components
│   ├── CafeMap.tsx       # Interactive map component
│   ├── CafeDetailSheet.tsx
│   ├── SearchBar.tsx
│   └── ...
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
├── scripts/
│   ├── switch-to-dev.js  # Switch to development
│   ├── switch-to-prod.js # Switch to production
│   ├── export-data.ts    # Export database
│   └── import-data.ts    # Import database
├── lib/                   # Utility functions
├── public/                # Static files
└── exports/               # Database exports (gitignored)
```

---

## Configuration

### Environment Variables

**Development (`.env.mysql`):**
```env
DATABASE_URL="mysql://root@localhost:3306/wfc-jogja"
NEXTAUTH_SECRET="your-secret"
BLOB_READ_WRITE_TOKEN="vercel-blob-token"
```

**Production (`.env.postgres`):**
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://ngopidijogja.vercel.app"
BLOB_READ_WRITE_TOKEN="vercel-blob-token"
```


---

## Deployment

### Deploy ke Vercel

```bash
# 1. Switch ke production mode
npm run switch:prod

# 2. Test build lokal
npm run build

# 3. Commit & push ke GitHub
git add .
git commit -m "Your message"
git push origin main

# 4. Vercel akan auto-deploy
# Monitor di: https://vercel.com/tiodwisatrios-projects/ngopidijogja
```

Vercel akan otomatis:
- Detect push ke GitHub
- Build aplikasi
- Deploy ke production
- URL: https://ngopidijogja.vercel.app

---

## Database Schema

### Models

- **Cafe** - Data cafe (nama, alamat, koordinat, dll)
- **OpeningHour** - Jam operasional (7 hari per cafe)
- **Facility** - Master fasilitas (Wi-Fi, Colokan, Toilet, dll)
- **CafeFacility** - Relasi many-to-many cafe-facility
- **PaymentMethod** - Master metode pembayaran
- **CafePaymentMethod** - Relasi many-to-many cafe-payment
- **CafeImage** - Gambar cafe (multiple images per cafe)
- **User** - User admin untuk manage data

### ER Diagram

```
Cafe 1---* OpeningHour
Cafe *---* Facility (via CafeFacility)
Cafe *---* PaymentMethod (via CafePaymentMethod)
Cafe 1---* CafeImage
```

---

## Contributing

Contributions are welcome! Silakan:

1. Fork repository
2. Buat branch baru (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

---

## License

This project is licensed under the MIT License.

---

## Author

**Tio Dwi Satrio**

- GitHub: [@tiodwisatrio](https://github.com/tiodwisatrio)

---

## Acknowledgments

- Next.js team untuk framework yang luar biasa
- Vercel untuk platform deployment gratis
- OpenStreetMap contributors untuk map tiles
- Leaflet untuk library maps yang powerful
- Prisma team untuk ORM yang developer-friendly

---

## Known Issues

- None at the moment

## Roadmap

- [ ] Add user reviews & ratings
- [ ] Add bookmark/favorite cafes
- [ ] Add cafe recommendations based on preferences
- [ ] Add admin dashboard analytics
- [ ] Add export cafe list to PDF
- [ ] Add share cafe link to social media
- [ ] Add PWA support

---

**Happy coding!** ☕✨
