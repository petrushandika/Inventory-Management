# XStock — Inventory Management System

A full-stack inventory management application for managing products, stock, suppliers, purchase orders, users, and expenses.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| State Management | Redux Toolkit + RTK Query |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Image Storage | Cloudinary |
| Maps | Leaflet + OpenStreetMap |

## Project Structure

```
Inventory-Management/
├── client/          # Next.js frontend
│   └── src/
│       ├── app/     # App Router pages
│       ├── state/   # Redux store + RTK Query
│       └── lib/     # Utilities (currency, sorting, CSV export)
├── server/          # Express backend
│   └── src/
│       ├── controllers/
│       ├── routes/
│       └── lib/     # Prisma client, Cloudinary
├── docs/            # Project documentation
└── README.md
```

## Features

- **Dashboard** — KPI cards, sales chart, purchase chart, expense summary, popular products
- **Products** — Full CRUD, image upload (Cloudinary), category, stock tracking
- **Inventory** — Stock level view with status indicators (Active / Normal / Low Stock / Out of Stock)
- **Purchase Orders** — Create POs, track status (Draft → Ordered → Received), auto-update stock on receive
- **Suppliers** — Full CRUD with interactive map (Leaflet) for location
- **Categories** — Full CRUD with color coding
- **Users** — Full CRUD with role management (Admin / Manager / Staff)
- **Expenses** — Expense overview with pie chart by category
- **Low Stock Notifications** — Real-time alerts in navbar for products below threshold
- **Export CSV** — Export any list page to CSV

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Cloudinary account (for image uploads)

### 1. Clone and install

```bash
git clone <repo>
cd Inventory-Management

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure environment variables

**Server** — copy and fill in `/server/.env`:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/inventory_management"
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Client** — create `/client/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### 3. Set up database

```bash
cd server
npx prisma migrate dev
npm run seed
```

### 4. Run development servers

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /dashboard | Dashboard metrics |
| GET/POST | /products | List / create products |
| GET/PUT/DELETE | /products/:id | Get / update / delete product |
| GET/POST | /purchase-orders | List / create POs |
| GET/PUT/DELETE | /purchase-orders/:id | Get / update / delete PO |
| GET/POST | /suppliers | List / create suppliers |
| GET/POST | /categories | List / create categories |
| GET/POST | /users | List / create users |
| GET | /expenses | Expenses by category |
| POST | /auth/login | Login |

## Default Login

After seeding:
- **Admin:** `admin` / `admin`
- **Manager:** `manager` / `manager`
- **Staff:** `staff` / `staff`

## Documentation

See `/docs` folder:
- [PRD.md](docs/PRD.md) — Product Requirements Document
- [MVP.md](docs/MVP.md) — MVP scope and feature status
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — System architecture
- [API.md](docs/API.md) — API reference
