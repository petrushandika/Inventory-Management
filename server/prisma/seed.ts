import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";
import "dotenv/config";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter } as any);

async function clearAllData() {
  // Delete in dependency order (children first, then parents)
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

async function seedModel(fileName: string, dataDirectory: string) {
  const filePath = path.join(dataDirectory, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found, skipping: ${fileName}`);
    return;
  }

  const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const modelName = path.basename(fileName, path.extname(fileName));
  const model: any = prisma[modelName as keyof typeof prisma];

  if (!model) {
    console.error(`No Prisma model matches: ${fileName}`);
    return;
  }

  for (const data of jsonData) {
    await model.create({ data });
  }

  console.log(`Seeded ${modelName} (${jsonData.length} records)`);
}

async function main() {
  const dataDirectory = path.join(__dirname, "data");

  await clearAllData();

  // Insert in dependency order (parents first, then children)
  const insertOrder = [
    "categories.json",
    "suppliers.json",
    "users.json",
    "products.json",
    "sales.json",
    "purchases.json",
    "expenses.json",
    "salesSummary.json",
    "purchaseSummary.json",
    "expenseSummary.json",
    "expenseByCategory.json",
  ];

  for (const fileName of insertOrder) {
    await seedModel(fileName, dataDirectory);
  }

  console.log("\nSeeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
