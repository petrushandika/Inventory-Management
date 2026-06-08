import { PrismaClient, OrderStatus, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import "dotenv/config";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter } as any);

const dataDir = path.join(__dirname, "data");

type ProductRow = {
  productId: string;
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  minStock: number;
  categoryId: string;
  image?: string;
};

type SupplierRow = { supplierId: string; name: string };

const CATEGORY_SUPPLIER: Record<string, string> = {
  cat1: "sup1",
  cat2: "sup2",
  cat3: "sup3",
  cat4: "sup4",
  cat5: "sup5",
  cat6: "sup6",
  cat7: "sup7",
  cat8: "sup8",
};

const EXPENSE_CATEGORIES = ["Office", "Salaries", "Professional", "Other"] as const;

function loadJson<T>(fileName: string): T[] {
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function uuid() {
  return crypto.randomUUID();
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d;
}

function monthStart(monthsAgo: number): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() - monthsAgo);
  return d;
}

async function clearAllData() {
  await prisma.purchaseOrderItems.deleteMany({});
  await prisma.purchaseOrders.deleteMany({});
  await prisma.expenseByCategory.deleteMany({});
  await prisma.sales.deleteMany({});
  await prisma.purchases.deleteMany({});
  await prisma.products.deleteMany({});
  await prisma.expenseSummary.deleteMany({});
  await prisma.salesSummary.deleteMany({});
  await prisma.purchaseSummary.deleteMany({});
  await prisma.expenses.deleteMany({});
  await prisma.users.deleteMany({});
  await prisma.suppliers.deleteMany({});
  await prisma.categories.deleteMany({});
  console.log("Cleared all existing data");
}

async function seedFromJson(model: keyof PrismaClient, fileName: string) {
  const rows = loadJson<Record<string, unknown>>(fileName);
  if (!rows.length) return;
  const client = prisma[model] as { create: (args: { data: unknown }) => Promise<unknown> };
  for (const data of rows) {
    await client.create({ data });
  }
  console.log(`Seeded ${fileName} (${rows.length} records)`);
}

async function seedUsers() {
  const team: {
    userId: string;
    name: string;
    email: string;
    username: string;
    password: string;
    role: UserRole;
    image: string;
  }[] = [
    {
      userId: "00000000-0000-0000-0000-000000000001",
      name: "Petrus Handika",
      email: "admin@xstock.com",
      username: "admin",
      password: "admin",
      role: "Admin",
      image: "https://i.pravatar.cc/150?u=xstock-admin",
    },
    {
      userId: "00000000-0000-0000-0000-000000000002",
      name: "Budi Santoso",
      email: "manager@xstock.com",
      username: "manager",
      password: "manager",
      role: "Manager",
      image: "https://i.pravatar.cc/150?u=xstock-manager",
    },
    {
      userId: "00000000-0000-0000-0000-000000000003",
      name: "Siti Rahayu",
      email: "staff@xstock.com",
      username: "staff",
      password: "staff",
      role: "Staff",
      image: "https://i.pravatar.cc/150?u=xstock-staff",
    },
    {
      userId: "00000000-0000-0000-0000-000000000004",
      name: "Andi Wijaya",
      email: "andi@xstock.com",
      username: "andi",
      password: "staff",
      role: "Staff",
      image: "https://i.pravatar.cc/150?u=xstock-andi",
    },
    {
      userId: "00000000-0000-0000-0000-000000000005",
      name: "Dewi Lestari",
      email: "dewi@xstock.com",
      username: "dewi",
      password: "staff",
      role: "Staff",
      image: "https://i.pravatar.cc/150?u=xstock-dewi",
    },
  ];

  for (const u of team) {
    const hash = await bcrypt.hash(u.password, 10);
    await prisma.users.create({
      data: {
        userId: u.userId,
        name: u.name,
        email: u.email,
        username: u.username,
        password: hash,
        role: u.role,
        image: u.image,
        createdAt: daysAgo(Math.floor(Math.random() * 180) + 30),
      },
    });
  }
  console.log(`Seeded users (${team.length} records) — admin/admin, manager/manager, staff/staff`);
}

async function seedPurchaseOrders() {
  type PODef = {
    orderId: string;
    supplierId: string;
    status: OrderStatus;
    notes: string;
    items: { productId: string; quantity: number; unitCost: number }[];
    createdAt: Date;
  };

  const orders: PODef[] = [
    {
      orderId: "po-001",
      supplierId: "sup1",
      status: "Draft",
      notes: "Pending approval for Q2 electronics restock",
      createdAt: daysAgo(2),
      items: [
        { productId: "p001", quantity: 50, unitCost: 680000 },
        { productId: "p003", quantity: 100, unitCost: 280000 },
      ],
    },
    {
      orderId: "po-002",
      supplierId: "sup2",
      status: "Ordered",
      notes: "Fashion restock — spring collection",
      createdAt: daysAgo(7),
      items: [
        { productId: "p008", quantity: 200, unitCost: 150000 },
        { productId: "p010", quantity: 80, unitCost: 520000 },
        { productId: "p012", quantity: 60, unitCost: 280000 },
      ],
    },
    {
      orderId: "po-003",
      supplierId: "sup5",
      status: "Received",
      notes: "Fitness equipment received and stocked",
      createdAt: daysAgo(14),
      items: [
        { productId: "p021", quantity: 40, unitCost: 240000 },
        { productId: "p023", quantity: 100, unitCost: 120000 },
      ],
    },
    {
      orderId: "po-004",
      supplierId: "sup6",
      status: "Received",
      notes: "Health & beauty batch — March delivery",
      createdAt: daysAgo(21),
      items: [{ productId: "p026", quantity: 150, unitCost: 105000 }],
    },
    {
      orderId: "po-005",
      supplierId: "sup3",
      status: "Cancelled",
      notes: "Cancelled — supplier out of stock",
      createdAt: daysAgo(30),
      items: [{ productId: "p013", quantity: 500, unitCost: 38000 }],
    },
    {
      orderId: "po-006",
      supplierId: "sup7",
      status: "Draft",
      notes: "Automotive accessories draft order",
      createdAt: daysAgo(1),
      items: [{ productId: "p029", quantity: 200, unitCost: 48000 }],
    },
    {
      orderId: "po-007",
      supplierId: "sup1",
      status: "Ordered",
      notes: "Webcam and keyboard urgent reorder",
      createdAt: daysAgo(5),
      items: [
        { productId: "p006", quantity: 30, unitCost: 780000 },
        { productId: "p002", quantity: 25, unitCost: 950000 },
      ],
    },
    {
      orderId: "po-008",
      supplierId: "sup8",
      status: "Received",
      notes: "Office supplies restock — received",
      createdAt: daysAgo(10),
      items: [
        { productId: "p033", quantity: 500, unitCost: 22000 },
        { productId: "p034", quantity: 300, unitCost: 33000 },
        { productId: "p035", quantity: 400, unitCost: 27000 },
      ],
    },
  ];

  for (const o of orders) {
    const totalCost = o.items.reduce((s, i) => s + i.quantity * i.unitCost, 0);
    await prisma.purchaseOrders.create({
      data: {
        orderId: o.orderId,
        supplierId: o.supplierId,
        status: o.status,
        notes: o.notes,
        totalCost,
        createdAt: o.createdAt,
        updatedAt: o.createdAt,
        items: {
          create: o.items.map((item) => ({
            itemId: uuid(),
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })),
        },
      },
    });
  }
  console.log(`Seeded purchaseOrders (${orders.length} orders)`);
}

async function seedSales(products: ProductRow[]) {
  const sales = [];
  for (let i = 0; i < 120; i++) {
    const product = products[i % products.length];
    const quantity = Math.floor(Math.random() * 8) + 1;
    const unitPrice = product.price;
    sales.push({
      saleId: uuid(),
      productId: product.productId,
      timestamp: daysAgo(Math.floor(Math.random() * 365)),
      quantity,
      unitPrice,
      totalAmount: quantity * unitPrice,
    });
  }
  for (const s of sales) {
    await prisma.sales.create({ data: s });
  }
  console.log(`Seeded sales (${sales.length} records)`);
}

async function seedPurchases(products: ProductRow[]) {
  const purchases = [];
  for (let i = 0; i < 80; i++) {
    const product = products[i % products.length];
    const supplierId = CATEGORY_SUPPLIER[product.categoryId] ?? "sup1";
    const quantity = Math.floor(Math.random() * 50) + 10;
    const unitCost = Math.round(product.price * (0.55 + Math.random() * 0.25));
    purchases.push({
      purchaseId: uuid(),
      productId: product.productId,
      supplierId,
      timestamp: daysAgo(Math.floor(Math.random() * 365)),
      quantity,
      unitCost,
      totalCost: quantity * unitCost,
    });
  }
  for (const p of purchases) {
    await prisma.purchases.create({ data: p });
  }
  console.log(`Seeded purchases (${purchases.length} records)`);
}

async function seedExpenses() {
  const expenses = [];
  for (let i = 0; i < 48; i++) {
    const category = EXPENSE_CATEGORIES[i % EXPENSE_CATEGORIES.length];
    const base =
      category === "Salaries" ? 8_000_000 :
      category === "Professional" ? 2_500_000 :
      category === "Office" ? 1_200_000 : 800_000;
    const amount = base + Math.round(Math.random() * base * 0.4);
    expenses.push({
      expenseId: uuid(),
      category,
      amount,
      timestamp: daysAgo(Math.floor(Math.random() * 365)),
    });
  }
  for (const e of expenses) {
    await prisma.expenses.create({ data: e });
  }
  console.log(`Seeded expenses (${expenses.length} records)`);
}

async function seedSummaries() {
  for (let m = 11; m >= 0; m--) {
    const date = monthStart(m);
    const salesTotal = 45_000_000 + Math.round(Math.random() * 30_000_000);
    const purchaseTotal = 30_000_000 + Math.round(Math.random() * 20_000_000);
    await prisma.salesSummary.create({
      data: {
        salesSummaryId: uuid(),
        totalValue: salesTotal,
        changePercentage: Math.round((Math.random() * 40 - 20) * 100) / 100,
        date,
      },
    });
    await prisma.purchaseSummary.create({
      data: {
        purchaseSummaryId: uuid(),
        totalPurchased: purchaseTotal,
        changePercentage: Math.round((Math.random() * 40 - 20) * 100) / 100,
        date,
      },
    });
  }

  for (let m = 5; m >= 0; m--) {
    const date = monthStart(m);
    const summaryId = uuid();
    const totalExpenses = 18_000_000 + Math.round(Math.random() * 12_000_000);
    await prisma.expenseSummary.create({
      data: {
        expenseSummaryId: summaryId,
        totalExpenses,
        date,
      },
    });

    const splits = [
      { category: "Salaries", pct: 0.45 },
      { category: "Office", pct: 0.25 },
      { category: "Professional", pct: 0.20 },
      { category: "Other", pct: 0.10 },
    ];
    for (const s of splits) {
      await prisma.expenseByCategory.create({
        data: {
          expenseByCategoryId: uuid(),
          expenseSummaryId: summaryId,
          category: s.category,
          amount: BigInt(Math.round(totalExpenses * s.pct)),
          date,
        },
      });
    }
  }
  console.log("Seeded salesSummary (12), purchaseSummary (12), expenseSummary + expenseByCategory (6 months)");
}

async function main() {
  await clearAllData();

  await seedFromJson("categories", "categories.json");
  await seedFromJson("suppliers", "suppliers.json");
  await seedFromJson("products", "products.json");

  const products = loadJson<ProductRow>("products.json");
  const suppliers = loadJson<SupplierRow>("suppliers.json");

  await seedUsers();
  await seedPurchaseOrders();
  await seedSales(products);
  await seedPurchases(products);
  await seedExpenses();
  await seedSummaries();

  console.log("\nSeeding complete!");
  console.log("Login credentials:");
  console.log("  admin   / admin   (Admin)");
  console.log("  manager / manager (Manager)");
  console.log("  staff   / staff   (Staff)");
  console.log(`\nData summary: ${products.length} products, ${suppliers.length} suppliers, 8 purchase orders, 120 sales, 80 purchases, 48 expenses`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
