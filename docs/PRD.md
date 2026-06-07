# Product Requirements Document (PRD)
## XStock — Inventory Management System

**Version:** 1.0  
**Last Updated:** June 2026  
**Status:** In Development

---

## 1. Overview

XStock is a web-based inventory management system designed for small-to-medium businesses to manage products, stock levels, suppliers, purchase orders, users, and financial expenses in one centralized dashboard.

---

## 2. Goals

| Goal | Description |
|---|---|
| Centralized control | Single platform to manage entire inventory lifecycle |
| Real-time visibility | Live stock levels, low stock alerts, dashboard KPIs |
| Supplier coordination | Track suppliers and link purchase orders |
| Role-based access | Limit actions based on user role (Admin / Manager / Staff) |
| Auditability | Track who changed what and when |

---

## 3. User Personas

### Admin
- Full access to all features
- Can manage users, roles, and system settings
- Can delete any record

### Manager
- Can manage products, inventory, suppliers, categories, purchase orders
- Can view all reports and dashboard
- Cannot manage users or change roles

### Staff
- Read-only access to products and inventory
- Cannot create, edit, or delete records

---

## 4. Feature Requirements

### 4.1 Dashboard
- **KPI Cards:** Total stock value, total sales, total purchases, total expenses, low stock count, user count
- **Sales Summary Chart:** Line/area chart of sales over time
- **Purchase Summary Chart:** Bar chart of purchases over time
- **Expense Summary:** Pie/donut chart by category
- **Popular Products:** Top products by sales volume

### 4.2 Products
- CRUD operations with validation
- Image upload (stored on Cloudinary)
- Category assignment
- Stock quantity tracking
- Price and rating fields
- Search and sort

### 4.3 Inventory
- View all products with stock status (In Stock / Low Stock / Critical)
- Inline stock update via edit page
- Delete product from inventory
- Search and sort

### 4.4 Purchase Orders
- Create orders with multiple line items (product + quantity + unit cost)
- Assign to supplier (optional)
- Status lifecycle: `Draft → Ordered → Received → Cancelled`
- **On Received:** automatically increment `stockQuantity` for each line item
- View PO detail with all items
- Delete only Draft or Cancelled orders

### 4.5 Suppliers
- CRUD operations
- Contact information (email, phone)
- Location with interactive map (Leaflet + OpenStreetMap)
- Reverse geocoding from map click
- Address search

### 4.6 Categories
- CRUD with name, description, color
- Color picker (preset + custom)
- Shows product count per category

### 4.7 Users
- CRUD operations
- Roles: Admin, Manager, Staff
- Email uniqueness enforced
- Profile avatar (initial letter fallback)

### 4.8 Expenses
- View expenses grouped by category
- Pie chart visualization
- Total expenses summary

### 4.9 Notifications
- Low stock alert badge on navbar bell icon
- Dropdown listing all products below threshold (≤ 20 units)
- Quick link to edit product

### 4.10 Export
- Export any list (Products, Suppliers, Users, Inventory) to CSV
- One-click download

---

## 5. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Page load time | < 2s on first load |
| API response time | < 500ms for list endpoints |
| Image upload size | Max 5MB per image |
| Browser support | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| Responsive | Desktop-first, works on tablet |

---

## 6. Out of Scope (v1.0)

- Mobile app
- Real-time websocket updates
- Multi-warehouse / multi-location stock
- Customer management / sales invoicing
- Barcode / QR code scanning
- Email notifications
- Dark mode (CSS variables ready, toggle not implemented)
- Audit log UI

---

## 7. Success Metrics

- User can create a purchase order and see stock update automatically ✓
- Low stock products are visible without navigating to inventory ✓
- Any list can be exported to CSV in one click ✓
- All CRUD operations complete without page refresh (SPA) ✓
