"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
function clearAllData() {
    return __awaiter(this, void 0, void 0, function* () {
        // Delete in dependency order (children first, then parents)
        yield prisma.expenseByCategory.deleteMany({});
        yield prisma.sales.deleteMany({});
        yield prisma.purchases.deleteMany({});
        yield prisma.products.deleteMany({});
        yield prisma.expenseSummary.deleteMany({});
        yield prisma.salesSummary.deleteMany({});
        yield prisma.purchaseSummary.deleteMany({});
        yield prisma.expenses.deleteMany({});
        yield prisma.users.deleteMany({});
        console.log("Cleared all existing data");
    });
}
function seedModel(fileName, dataDirectory) {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = path_1.default.join(dataDirectory, fileName);
        if (!fs_1.default.existsSync(filePath)) {
            console.warn(`File not found, skipping: ${fileName}`);
            return;
        }
        const jsonData = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
        const modelName = path_1.default.basename(fileName, path_1.default.extname(fileName));
        const model = prisma[modelName];
        if (!model) {
            console.error(`No Prisma model matches: ${fileName}`);
            return;
        }
        for (const data of jsonData) {
            yield model.create({ data });
        }
        console.log(`Seeded ${modelName} (${jsonData.length} records)`);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const dataDirectory = path_1.default.join(__dirname, "data");
        yield clearAllData();
        // Insert in dependency order (parents first, then children)
        const insertOrder = [
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
            yield seedModel(fileName, dataDirectory);
        }
        console.log("\nSeeding complete!");
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
