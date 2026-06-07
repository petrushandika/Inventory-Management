# System Architecture
## XStock — Inventory Management System

---

## Overview

XStock follows a standard client-server architecture with a React SPA frontend and a REST API backend, backed by a PostgreSQL relational database.

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│                                                         │
│   Next.js 16 (App Router)  ←→  Redux + RTK Query       │
│   Tailwind CSS v4                                       │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / REST (JSON)
                       │ localhost:3001
┌──────────────────────▼──────────────────────────────────┐
│                   Express Server                        │
│                                                         │
│   Routes → Controllers → Prisma ORM                    │
│   Middleware: CORS, Helmet, Morgan, errorHandler        │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┴───────────────┐
        │                              │
┌───────▼────────┐          ┌──────────▼─────────┐
│  PostgreSQL    │          │   Cloudinary CDN   │
│  (Prisma ORM)  │          │  (Image Storage)   │
└────────────────┘          └────────────────────┘
```

---

## Frontend Architecture

### Directory Structure
```
client/src/
├── app/
│   ├── (components)/        # Shared UI components
│   │   ├── Breadcrumb/
│   │   ├── Header/
│   │   ├── LocationPicker/  # Leaflet map component
│   │   ├── Navbar/          # With low-stock notification bell
│   │   ├── Pagination/
│   │   ├── Rating/
│   │   ├── Sidebar/
│   │   └── SortIcon/
│   ├── dashboard/           # Dashboard + chart cards
│   ├── products/            # List + new + [id]/edit
│   ├── inventory/           # List + [id]/edit (redirects to products)
│   ├── purchases/           # List + new + [id] (PO detail)
│   ├── suppliers/           # List + new + [id]/edit
│   ├── categories/          # List + new + [id]/edit
│   ├── users/               # List + new + [userId]/edit
│   ├── expenses/            # Expense chart page
│   ├── settings/
│   └── login/
├── state/
│   ├── api.ts               # RTK Query endpoints (single source of truth)
│   └── index.ts             # Redux store
└── lib/
    ├── currency.ts          # formatRupiah utility
    ├── useSort.ts           # Generic sort hook
    └── exportCsv.ts         # CSV export utility
```

### State Management

- **Redux Persist** — persists auth state across page reloads
- **RTK Query** — all server state (products, users, etc.) with automatic caching + invalidation
- **React useState** — local UI state (modals, form fields, search term)

### Page Pattern (all CRUD pages)

```
List Page (e.g. /products)
  ├── Header: title + count | search input + Add button
  ├── Optional: filter pills (users: role filter, categories: sort)
  └── Table/Grid + Pagination + Delete Modal

Add Page (e.g. /products/new)
  ├── Breadcrumb
  ├── Page title + subtitle
  └── Single card:
      ├── Form fields (2-col or 3-col grid)
      └── Footer: Required note | Cancel + Submit

Edit Page (e.g. /products/[id]/edit)
  └── Same structure as Add Page, pre-filled with existing data
```

---

## Backend Architecture

### Directory Structure
```
server/src/
├── controllers/
│   ├── authController.ts
│   ├── dashboardController.ts
│   ├── productController.ts       # Cloudinary upload/delete
│   ├── purchaseOrderController.ts # PO CRUD + receive logic
│   ├── supplierController.ts
│   ├── categoryController.ts
│   ├── userController.ts
│   └── expenseController.ts
├── routes/
│   └── *.ts                       # One file per resource
├── middleware/
│   └── errorHandler.ts
└── lib/
    ├── prisma.ts                  # Lazy singleton (PrismaPg adapter)
    └── cloudinary.ts              # uploadImage, deleteImage, publicIdFromUrl
```

### Request Flow
```
HTTP Request
  → Express Router
  → Controller function
  → Prisma ORM query
  → PostgreSQL
  → JSON response
```

### Error Handling
All controller functions are `async` and forward errors to `next(error)`. The global `errorHandler` middleware catches them and returns:
```json
{ "message": "...", "stack": "..." }
```

---

## Database Schema

```
Users
Categories ──────────────── Products ────── Sales
                                │
Suppliers ── Purchases ─────────┘
         └── PurchaseOrders ── PurchaseOrderItems ── Products
                │
Expenses
ExpenseSummary ── ExpenseByCategory
SalesSummary
PurchaseSummary
```

### Key Relationships
- `Products` → `Categories` (optional, many-to-one)
- `Purchases` → `Products` + `Suppliers` (historical purchase records)
- `PurchaseOrders` → `Suppliers` (optional)
- `PurchaseOrderItems` → `PurchaseOrders` + `Products`
- When a PO status changes to `Received`, each item's `product.stockQuantity` is incremented

---

## Image Storage Flow

```
Client: base64 data URI (from file input)
  → POST /products with { image: "data:image/png;base64,..." }
  → productController detects base64
  → cloudinary.uploadImage() → returns secure_url
  → Store secure_url in DB (not base64)
  → Response includes Cloudinary URL
```

---

## Key Technical Decisions

| Decision | Rationale |
|---|---|
| Next.js App Router | File-based routing, Server Components, streaming |
| RTK Query over SWR/React Query | Already using Redux; unified state + server state |
| Prisma PG Adapter (not standard) | Required for PgBouncer / serverless PostgreSQL compat |
| `dynamic(() => import(...), { ssr: false })` for charts + map | Recharts ResizeObserver and Leaflet are browser-only APIs |
| Cloudinary over S3 | Free tier, no AWS setup needed for development |
| `unoptimized: true` in next.config | Required for base64 data URIs (pre-Cloudinary migration) |
