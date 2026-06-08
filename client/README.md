# XStock — Client (Frontend)

Frontend **XStock Inventory Management System** — admin panel untuk manajemen inventori, produk, supplier, purchase order, user, dan expenses.

| Item | Detail |
|---|---|
| Framework | Next.js 16 (App Router) |
| Default port | `3000` |
| URL (dev) | `http://localhost:3000` |
| Backend API | `http://localhost:3001` (harus sudah running) |

---

## Daftar Isi

1. [Prasyarat](#prasyarat)
2. [Struktur Folder](#struktur-folder)
3. [Setup Environment](#setup-environment)
4. [Instalasi Dependencies](#instalasi-dependencies)
5. [Menjalankan Development Server](#menjalankan-development-server)
6. [Build & Production](#build--production)
7. [Halaman & Routing](#halaman--routing)
8. [State Management](#state-management)
9. [Default Login](#default-login)
10. [Troubleshooting](#troubleshooting)

---

## Prasyarat

| Software | Versi minimum | Cek versi |
|---|---|---|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |

**Backend harus sudah berjalan** sebelum menggunakan frontend. Ikuti setup di [`../server/README.md`](../server/README.md):

1. PostgreSQL + migrate + seed
2. `cd server && npm run dev` → API di port `3001`

---

## Struktur Folder

```
client/
├── src/
│   ├── app/
│   │   ├── (components)/       # Navbar, Sidebar, Breadcrumb, Pagination, dll.
│   │   ├── dashboard/            # Dashboard + chart cards
│   │   ├── products/             # List, new, [productId]/edit
│   │   ├── inventory/            # View stock
│   │   ├── users/                # CRUD user
│   │   ├── categories/           # CRUD kategori
│   │   ├── suppliers/            # CRUD supplier + map
│   │   ├── purchases/            # Purchase Order
│   │   ├── expenses/             # Chart pengeluaran
│   │   ├── settings/             # Profil & preferensi
│   │   ├── login/                # Halaman login (tanpa sidebar)
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Root → Dashboard
│   │   ├── dashboardwrapper.tsx  # Shell Navbar + Sidebar
│   │   └── redux.tsx             # Redux Provider
│   ├── state/
│   │   ├── api.ts                # RTK Query endpoints
│   │   └── index.ts              # Redux store + persist
│   └── lib/
│       ├── currency.ts           # formatRupiah
│       ├── useSort.ts            # Hook sorting tabel
│       └── exportCsv.ts          # Export CSV utility
├── public/                       # Static assets
├── .env.local                    # Environment (buat manual)
├── .env.example                  # Template environment
├── next.config.mjs               # Next.js config (Cloudinary images)
├── package.json
└── tsconfig.json
```

---

## Setup Environment

Salin template environment:

```bash
cd client
cp .env.example .env.local
```

Isi `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

| Variable | Wajib | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Ya | Base URL backend Express. Prefix `NEXT_PUBLIC_` wajib agar bisa diakses di browser |

**Penting:**
- File harus bernama `.env.local` (bukan `.env`) untuk Next.js development
- Setelah mengubah env, **restart** dev server (`Ctrl+C` → `npm run dev`)
- Jika backend pakai port lain, sesuaikan URL di sini

---

## Instalasi Dependencies

```bash
cd client
npm install
```

---

## Menjalankan Development Server

### Terminal 1 — Backend (wajib)

```bash
cd server
npm run dev
```

### Terminal 2 — Frontend

```bash
cd client
npm run dev
```

Buka browser: [http://localhost:3000](http://localhost:3000)

Login di: [http://localhost:3000/login](http://localhost:3000/login)

Dev server menggunakan **hot reload** — perubahan file langsung terlihat di browser.

---

## Build & Production

```bash
# Build optimized production bundle
npm run build

# Jalankan production server
npm start
```

Production server default di port `3000`. Set `PORT=4000 npm start` jika perlu port lain.

Pastikan `.env.local` (atau env di hosting) sudah berisi:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

### Lint

```bash
npm run lint
```

---

## Halaman & Routing

| Route | Halaman | Keterangan |
|---|---|---|
| `/` | Dashboard | Root, render dashboard |
| `/login` | Login | Tanpa sidebar shell |
| `/dashboard` | Dashboard | KPI + charts |
| `/inventory` | Inventory | View stock + status badge |
| `/products` | Products | List produk |
| `/products/new` | Add Product | Form tambah |
| `/products/[productId]/edit` | Edit Product | Form edit |
| `/users` | Users | List user |
| `/users/new` | Add User | Form tambah |
| `/users/[userId]/edit` | Edit User | Form edit |
| `/categories` | Categories | List kategori |
| `/categories/new` | Add Category | Form tambah |
| `/categories/[categoryId]/edit` | Edit Category | Form edit |
| `/suppliers` | Suppliers | List supplier |
| `/suppliers/new` | Add Supplier | Form + peta Leaflet |
| `/suppliers/[supplierId]/edit` | Edit Supplier | Form edit |
| `/purchases` | Purchase Orders | List PO + ubah status |
| `/purchases/new` | New PO | Form multi-item |
| `/purchases/[orderId]` | PO Detail | Detail purchase order |
| `/expenses` | Expenses | Pie chart pengeluaran |
| `/settings` | Settings | Profil, avatar, dark mode |

Navigasi sidebar: `src/app/(components)/Sidebar/index.tsx`

---

## State Management

| Layer | Teknologi | File |
|---|---|---|
| Server state (API) | RTK Query | `src/state/api.ts` |
| Global UI state | Redux | `src/state/index.ts` |
| Persist | redux-persist | Auth & preferensi tersimpan di localStorage |

Semua API call didefinisikan di `api.ts`:

```typescript
// Contoh penggunaan di komponen
const { data, isLoading } = useGetProductsQuery(searchTerm);
const [createProduct] = useCreateProductMutation();
const [login] = useLoginMutation();
```

Base URL diambil dari:

```typescript
baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL })
```

---

## Tech Stack

| Kategori | Library |
|---|---|
| UI | React 19, Tailwind CSS v4 |
| Icons | Lucide React |
| Charts | Recharts |
| Maps | Leaflet + react-leaflet |
| Tables/Grid | Custom + MUI Data Grid (legacy) |
| Images | Next.js Image + Cloudinary remote |

---

## Default Login

Setelah backend di-seed (`npm run seed` di folder server):

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin` |

Setelah login sukses, redirect ke `/dashboard`.

---

## Troubleshooting

### Halaman kosong / "Failed to fetch" / network error

1. Pastikan backend running: `curl http://localhost:3001/health`
2. Cek `NEXT_PUBLIC_API_BASE_URL` di `.env.local`
3. Restart frontend setelah ubah env

### CORS error di browser console

Backend `CLIENT_URL` harus `http://localhost:3000`. Edit `server/.env` lalu restart backend.

### Gambar produk tidak tampil

`next.config.mjs` sudah allow hostname `res.cloudinary.com`. Pastikan URL gambar valid dari Cloudinary.

### Map (Leaflet) tidak muncul di Supplier form

Leaflet di-load dengan `dynamic(..., { ssr: false })`. Pastikan JavaScript enabled dan tidak ada ad-blocker yang memblok tile map.

### Port 3000 already in use

```bash
lsof -i :3000
kill -9 <PID>
```

Atau jalankan di port lain:

```bash
npm run dev -- -p 3002
```

Sesuaikan `CLIENT_URL` di server ke `http://localhost:3002`.

### Login gagal meski kredensial benar

- Pastikan seed sudah dijalankan di server
- Tes API langsung:

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

---

## Alur Setup Lengkap (Quick Start)

```bash
# 1. Database + backend
cd server
cp .env.example .env          # isi DATABASE_URL & Cloudinary
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev                     # → port 3001

# 2. Frontend (terminal baru)
cd client
cp .env.example .env.local
npm install
npm run dev                     # → port 3000

# 3. Buka browser
open http://localhost:3000/login
# Login: admin / admin
```

---

## Dokumentasi Terkait

- [Server README](../server/README.md) — setup backend, migrate, seed
- [API Reference](../docs/API.md)
- [Architecture](../docs/ARCHITECTURE.md)
- [PRD](../docs/PRD.md)
- [LSP Documentation](../docs/LSP.md)
