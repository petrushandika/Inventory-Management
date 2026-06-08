# API Reference
## XStock — Inventory Management System

Base URL: `http://localhost:3001`

---

## Authentication

### POST /auth/login
```json
// Request
{ "username": "admin", "password": "admin" }

// Response 200
{ "user": { "userId": "...", "name": "...", "email": "...", "role": "Admin" } }

// Response 401
{ "message": "Invalid credentials" }
```

---

## Dashboard

### GET /dashboard
Returns all dashboard metrics in one request.

```json
// Response 200
{
  "stats": {
    "totalSalesAmount": 12500000,
    "totalSalesCount": 48,
    "totalPurchaseCost": 8200000,
    "totalPurchaseCount": 12,
    "totalExpenses": 3100000,
    "productCount": 25,
    "userCount": 8,
    "lowStockCount": 3,
    "totalStockValue": 45000000
  },
  "popularProducts": [...],
  "salesSummary": [...],
  "purchaseSummary": [...],
  "expenseSummary": [...],
  "expenseByCategorySummary": [...]
}
```

---

## Products

### GET /products
Query params: `?search=keyword`

### POST /products
```json
{
  "name": "Wireless Headphones",
  "price": 350000,
  "stockQuantity": 50,
  "rating": 4.5,
  "categoryId": "uuid",
  "image": "data:image/png;base64,..." // or Cloudinary URL
}
```
Image is auto-uploaded to Cloudinary if base64.

### PUT /products/:productId
Same body as POST (all fields optional). Replaces old Cloudinary image if new base64 provided.

### DELETE /products/:productId
Also deletes image from Cloudinary.

---

## Purchase Orders

### GET /purchase-orders
Query params: `?status=Draft|Ordered|Received|Cancelled`

```json
// Response 200
[
  {
    "orderId": "uuid",
    "supplierId": "uuid",
    "status": "Draft",
    "notes": "Q2 restock",
    "totalCost": 1500000,
    "createdAt": "2026-06-07T...",
    "supplier": { "supplierId": "...", "name": "TechSource" },
    "items": [
      {
        "itemId": "uuid",
        "productId": "uuid",
        "quantity": 10,
        "unitCost": 150000,
        "product": { "productId": "...", "name": "USB Cable", "stockQuantity": 5 }
      }
    ]
  }
]
```

### POST /purchase-orders
```json
{
  "supplierId": "uuid",      // optional
  "notes": "...",            // optional
  "items": [
    { "productId": "uuid", "quantity": 10, "unitCost": 150000 }
  ]
}
```
`totalCost` is calculated server-side from items.

### GET /purchase-orders/:orderId
Returns single PO with supplier and items (including product details).

### PUT /purchase-orders/:orderId
```json
{
  "status": "Received",   // Triggers stock increment for all items
  "notes": "...",
  "supplierId": "uuid"
}
```
**When status changes to `Received`:** each `item.quantity` is added to `product.stockQuantity`.

### DELETE /purchase-orders/:orderId
Only allowed if status is `Draft` or `Cancelled`. Returns 400 otherwise.

---

## Suppliers

### GET /suppliers
Query params: `?search=keyword`

### POST /suppliers
```json
{ "name": "TechSource", "email": "...", "phone": "...", "address": "..." }
```

### PUT /suppliers/:supplierId
### DELETE /suppliers/:supplierId

---

## Categories

### GET /categories
Query params: `?search=keyword`  
Response includes `_count.Products` (number of products in category).

### POST /categories
```json
{ "name": "Electronics", "description": "...", "color": "#3b82f6" }
```

### PUT /categories/:categoryId
### DELETE /categories/:categoryId

---

## Users

### GET /users
### POST /users
```json
{ "name": "John Doe", "email": "john@co.com", "role": "Staff" }
```
Roles: `Admin` | `Manager` | `Staff`

### PUT /users/:userId
### DELETE /users/:userId

---

## Expenses

### GET /expenses
Returns expense categories with totals.

```json
[
  { "expenseByCategoryId": "...", "category": "Marketing", "amount": "1500000", "date": "..." }
]
```

---

## Status Codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | Deleted (no content) |
| 400 | Bad request (validation error) |
| 401 | Unauthorized |
| 404 | Not found |
| 500 | Internal server error |
