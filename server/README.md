# XStock — Server (Backend API)

REST API backend untuk **XStock Inventory Management System**. Dibangun dengan Express.js, TypeScript, Prisma 7, dan PostgreSQL.

| Item | Detail |
|---|---|
| Default port | `3001` |
| Base URL (dev) | `http://localhost:3001` |
| Health check | `GET /health` |

---

## Daftar Isi

1. [Prasyarat](#prasyarat)
2. [Struktur Folder](#struktur-folder)
3. [Setup PostgreSQL](#setup-postgresql)
4. [Konfigurasi Environment](#konfigurasi-environment)
5. [Instalasi Dependencies](#instalasi-dependencies)
6. [Database: Generate, Migrate, Seed](#database-generate-migrate-seed)
7. [Menjalankan Server](#menjalankan-server)
8. [Build Production](#build-production)
9. [Perintah Prisma](#perintah-prisma)
10. [API Routes](#api-routes)
11. [Default Login (Seed)](#default-login-seed)
12. [Cloudinary Setup](#cloudinary-setup)
13. [Troubleshooting](#troubleshooting)

---

## Prasyarat

Pastikan sudah terinstall:

| Software | Versi minimum | Cek versi |
|---|---|---|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| PostgreSQL | 14+ | `psql --version` |

Opsional:
- **pgAdmin** atau **DBeaver** — GUI untuk inspeksi database
- Akun **Cloudinary** — upload gambar produk & avatar user

---

## Struktur Folder

```
server/
├── prisma/
│   ├── schema.prisma          # Definisi model database
│   ├── seed.ts                # Script seed data
│   ├── data/                  # JSON seed (products, users, dll.)
│   └── migrations/            # Riwayat migrasi SQL
├── prisma.config.ts           # Konfigurasi Prisma 7 + adapter PG
├── src/
│   ├── index.ts               # Entry point Express
│   ├── controllers/           # Logic bisnis per resource
│   ├── routes/                # Definisi endpoint
│   ├── middleware/            # errorHandler, notFound
│   └── lib/
│       ├── prisma.ts          # Prisma Client singleton
│       └── cloudinary.ts      # Upload/delete gambar
├── .env                       # Environment variables (buat manual)
├── .env.example               # Template environment
├── package.json
└── tsconfig.json
```

---

## Setup PostgreSQL

### Opsi A — PostgreSQL lokal (macOS Homebrew)

```bash
# Install PostgreSQL (jika belum ada)
brew install postgresql@16
brew services start postgresql@16

# Buat database
createdb inventory_db

# Verifikasi koneksi
psql -d inventory_db -c "SELECT version();"
```

### Opsi B — PostgreSQL via Docker

```bash
docker run --name xstock-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=inventory_db \
  -p 5432:5432 \
  -d postgres:16

# Verifikasi
docker exec -it xstock-postgres psql -U postgres -d inventory_db -c "\dt"
```

### Opsi C — PostgreSQL yang sudah ada

Buat database kosong:

```sql
CREATE DATABASE inventory_db;
```

---

## Konfigurasi Environment

Salin template environment:

```bash
cd server
cp .env.example .env
```

Isi file `.env`:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
DATABASE_URL="postgresql://postgres:password@localhost:5432/inventory_db"

# CORS — harus sama dengan URL frontend
CLIENT_URL=http://localhost:3000

# Cloudinary (wajib untuk upload gambar produk/user)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

| Variable | Wajib | Keterangan |
|---|---|---|
| `DATABASE_URL` | Ya | Connection string PostgreSQL |
| `PORT` | Tidak | Default `3001` |
| `CLIENT_URL` | Ya (dev) | Origin CORS frontend, default `http://localhost:3000` |
| `CLOUDINARY_*` | Ya* | Diperlukan saat upload gambar; tanpa ini create/update product dengan image gagal |

---

## Instalasi Dependencies

```bash
cd server
npm install
```

---

## Database: Generate, Migrate, Seed

Jalankan perintah berikut **berurutan** dari folder `server/`.

### Langkah 1 — Generate Prisma Client

```bash
npx prisma generate
```

Membuat client TypeScript dari `prisma/schema.prisma`. Wajib dijalankan setiap kali schema berubah.

### Langkah 2 — Migrate Database

```bash
npx prisma migrate dev
```

Perintah ini akan:
- Membaca schema Prisma
- Menerapkan migrasi ke PostgreSQL
- Menjalankan `prisma generate` otomatis

**Jika diminta nama migrasi baru**, contoh:

```bash
npx prisma migrate dev --name sync_schema
```

**Catatan migration drift:** Schema saat ini (`Categories`, `Suppliers`, `PurchaseOrders`, field auth `Users`, dll.) mungkin belum sepenuhnya tercatat di migrasi lama. Jika Prisma mendeteksi drift, pilih salah satu:

| Situasi | Solusi |
|---|---|
| Development, data boleh hilang | `npx prisma migrate reset` lalu seed ulang |
| Ingin push schema tanpa migrasi file | `npx prisma db push` (dev only) |
| Production | Buat migrasi baru dengan `migrate dev`, jangan `db push` |

Cek status migrasi:

```bash
npx prisma migrate status
```

### Langkah 3 — Seed Data

```bash
npm run seed
```

Atau:

```bash
npx prisma db seed
```

Seed akan:
1. Menghapus data lama (urutan dependency)
2. Mengisi data dari `prisma/data/*.json`
3. Membuat akun admin default

### Langkah 4 — Verifikasi (opsional)

```bash
# Buka GUI database di browser
npx prisma studio
```

Prisma Studio berjalan di `http://localhost:5555`.

---

## Menjalankan Server

### Development (hot reload)

```bash
npm run dev
```

Menggunakan `tsx watch src/index.ts`. Output sukses:

```
Server running on port 3001 (development)
```

### Tes health check

```bash
curl http://localhost:3001/health
```

Response:

```json
{ "status": "ok", "timestamp": "..." }
```

---

## Build Production

```bash
npm run build    # Compile TypeScript → dist/
npm start        # Jalankan node dist/index.js
```

Pastikan sebelum deploy:
- `NODE_ENV=production`
- `DATABASE_URL` mengarah ke database production
- Migrasi sudah di-deploy: `npx prisma migrate deploy`

---

## Perintah Prisma

| Perintah | Fungsi |
|---|---|
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma migrate dev` | Buat & terapkan migrasi (development) |
| `npx prisma migrate deploy` | Terapkan migrasi (production/CI) |
| `npx prisma migrate status` | Cek status migrasi |
| `npx prisma migrate reset` | Reset DB + jalankan migrasi + seed |
| `npx prisma db push` | Push schema langsung (dev, tanpa migration file) |
| `npx prisma db pull` | Pull schema dari database existing |
| `npx prisma studio` | GUI browser untuk data |
| `npx prisma validate` | Validasi syntax schema |
| `npm run seed` | Jalankan seed script |

---

## API Routes

Base URL: `http://localhost:3001`

| Prefix | File route | Deskripsi |
|---|---|---|
| `GET /health` | — | Health check |
| `/auth` | `authRoutes.ts` | Login |
| `/dashboard` | `dashboardRoutes.ts` | KPI & chart data |
| `/products` | `productRoutes.ts` | CRUD produk + Cloudinary |
| `/users` | `userRoutes.ts` | CRUD user |
| `/categories` | `categoryRoutes.ts` | CRUD kategori |
| `/suppliers` | `supplierRoutes.ts` | CRUD supplier |
| `/purchase-orders` | `purchaseOrderRoutes.ts` | Purchase Order + update stock |
| `/expenses` | `expenseRoutes.ts` | Data pengeluaran |

Dokumentasi lengkap: [`../docs/API.md`](../docs/API.md)

### Ringkasan endpoint

```
POST   /auth/login
GET    /dashboard

GET    /products
POST   /products
PUT    /products/:productId
DELETE /products/:productId

GET    /users
POST   /users
PUT    /users/:userId
DELETE /users/:userId

GET    /categories
POST   /categories
PUT    /categories/:categoryId
DELETE /categories/:categoryId

GET    /suppliers
POST   /suppliers
PUT    /suppliers/:supplierId
DELETE /suppliers/:supplierId

GET    /purchase-orders?status=Draft
POST   /purchase-orders
GET    /purchase-orders/:orderId
PUT    /purchase-orders/:orderId
DELETE /purchase-orders/:orderId

GET    /expenses
```

---

## Default Login (Seed)

Setelah seed berhasil:

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin` |
| Email | `admin@xstock.com` |
| Role | `Admin` |

Login via frontend `http://localhost:3000/login` atau API:

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

---

## Cloudinary Setup

1. Daftar di [https://cloudinary.com](https://cloudinary.com)
2. Buka **Dashboard → Settings → API Keys**
3. Salin `Cloud name`, `API Key`, `API Secret` ke `.env`
4. Restart server setelah mengubah `.env`

Upload flow:
- Client kirim gambar sebagai base64 (`data:image/...`)
- Server upload ke Cloudinary folder `inventory/products` atau `inventory/users`
- URL Cloudinary disimpan di database

---

## Troubleshooting

### `DATABASE_URL is not set`

File `.env` belum dibuat atau tidak ada di folder `server/`. Jalankan `cp .env.example .env` dan isi `DATABASE_URL`.

### `Can't reach database server`

- Pastikan PostgreSQL berjalan: `brew services list` atau `docker ps`
- Cek host/port/user/password di `DATABASE_URL`
- Tes: `psql "postgresql://postgres:password@localhost:5432/inventory_db"`

### Migration drift / schema out of sync

```bash
npx prisma migrate status
npx prisma migrate reset   # hati-hati: hapus semua data
npm run seed
```

### CORS error dari frontend

Pastikan `CLIENT_URL` di `.env` server sama persis dengan URL frontend (mis. `http://localhost:3000`).

### Upload gambar gagal

- Isi semua `CLOUDINARY_*` di `.env`
- Restart server setelah edit `.env`

### Port 3001 already in use

```bash
lsof -i :3001
kill -9 <PID>
```

Atau ubah `PORT=3002` di `.env` dan sesuaikan `NEXT_PUBLIC_API_BASE_URL` di client.

---

## Dokumentasi Terkait

- [API Reference](../docs/API.md)
- [Architecture](../docs/ARCHITECTURE.md)
- [LSP Documentation](../docs/LSP.md)
- [Client README](../client/README.md)
