# MVP Scope & Feature Status
## XStock — Inventory Management System

---

## MVP Definition

The MVP delivers a fully functional inventory management system that covers the core business loop:

**Stock in → Stock tracking → Stock out**

Specifically: receive products from suppliers (Purchase Orders), track current stock levels, and monitor through a dashboard.

---

## Feature Status

| Feature | Status | Notes |
|---|---|---|
| **Dashboard** | ✅ Done | KPI cards, 4 charts, popular products |
| **Products CRUD** | ✅ Done | With image upload (Cloudinary) |
| **Inventory View** | ✅ Done | Stock status indicators |
| **Suppliers CRUD** | ✅ Done | With Leaflet map location picker |
| **Categories CRUD** | ✅ Done | With color picker |
| **Users CRUD** | ✅ Done | Role-based (Admin/Manager/Staff) |
| **Expenses View** | ✅ Done | Pie chart by category |
| **Purchase Orders** | 🔄 In Progress | Schema ready, backend/frontend pending |
| **Low Stock Alerts** | 🔄 In Progress | UI pending |
| **Export CSV** | 🔄 In Progress | Utility pending |
| **Authentication** | ✅ Done | Login page, JWT session |
| **Breadcrumb Nav** | ✅ Done | All pages |
| **Full-page Edit** | ✅ Done | All CRUD pages navigate to dedicated edit page |

---

## Completed This Sprint

1. ✅ Full-page add/edit forms (replaced inline panels)
2. ✅ Consistent header layout (search + add button on same row)
3. ✅ Leaflet map in supplier location (draggable pin, satellite view, geolocation, search)
4. ✅ Cloudinary image storage (backend integration)
5. ✅ `cursor-pointer` global CSS fix

---

## Pending for v1.0 Release

### Must Have
- [ ] Purchase Orders — backend controller + routes
- [ ] Purchase Orders — frontend pages (list, new, detail)
- [ ] Purchase Orders — sidebar link
- [ ] Low Stock — navbar notification bell
- [ ] Export CSV — utility + buttons on all list pages

### Should Have
- [ ] Prisma migration: `add_purchase_orders` (requires DB reset confirmation)
- [ ] Seed data updated for new models
- [ ] Dashboard: link low stock card to inventory filter

### Nice to Have
- [ ] User profile / settings page
- [ ] Dark mode toggle
- [ ] Audit log
- [ ] Barcode generation

---

## Known Issues

| Issue | Severity | Status |
|---|---|---|
| DB migration drift requires reset | Medium | Awaiting user confirmation |
| Cloudinary env vars not filled | High | User must fill `.env` |
| Purchase Orders not yet accessible | High | Backend not running |

---

## Tech Debt

- `CreateProductModal.tsx` and `EditProductModal.tsx` still exist but are unused — can be deleted
- `UserModal.tsx` still exists but is unused — can be deleted
- Inventory edit redirects to `/products/[id]/edit` — consider a dedicated inventory-focused edit page

---

## Roadmap After v1.0

| Version | Features |
|---|---|
| v1.1 | Stock movement history, audit log |
| v1.2 | Customer management + sales invoicing |
| v1.3 | Barcode/QR scanning |
| v2.0 | Multi-warehouse, mobile app |
