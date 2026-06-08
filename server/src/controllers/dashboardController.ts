import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { countLowStockProducts } from "../lib/stockStatus.js";

export const getDashboardMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      popularProducts,
      salesSummary,
      purchaseSummary,
      expenseSummary,
      expenseByCategoryRaw,
      salesAggregate,
      purchasesAggregate,
      expensesAggregate,
      productCount,
      userCount,
      allProductsForStock,
      latestSale,
      latestPurchase,
    ] = await Promise.all([
      prisma.products.findMany({
        take: 15,
        orderBy: { stockQuantity: "desc" },
      }),
      prisma.salesSummary.findMany({
        take: 12,
        orderBy: { date: "asc" },
      }),
      prisma.purchaseSummary.findMany({
        take: 12,
        orderBy: { date: "asc" },
      }),
      prisma.expenseSummary.findMany({
        take: 5,
        orderBy: { date: "desc" },
      }),
      prisma.expenseByCategory.findMany({
        take: 20,
        orderBy: { date: "desc" },
      }),
      prisma.sales.aggregate({
        _sum: { totalAmount: true, quantity: true },
        _count: { saleId: true },
      }),
      prisma.purchases.aggregate({
        _sum: { totalCost: true, quantity: true },
        _count: { purchaseId: true },
      }),
      prisma.expenses.aggregate({
        _sum: { amount: true },
        _count: { expenseId: true },
      }),
      prisma.products.count(),
      prisma.users.count(),
      prisma.products.findMany({ select: { price: true, stockQuantity: true, minStock: true } }),
      prisma.sales.findFirst({ orderBy: { timestamp: "desc" }, select: { timestamp: true } }),
      prisma.purchases.findFirst({ orderBy: { timestamp: "desc" }, select: { timestamp: true } }),
    ]);

    const expenseByCategorySummary = expenseByCategoryRaw.map((item) => ({
      ...item,
      amount: item.amount.toString(),
    }));

    const lowStockCount = countLowStockProducts(allProductsForStock);
    const totalStockValue = allProductsForStock.reduce(
      (sum, p) => sum + p.price * p.stockQuantity,
      0
    );

    // "Recent 30 days" anchored to the latest record in DB (not today)
    const recentSaleCutoff = latestSale
      ? new Date(latestSale.timestamp.getTime() - 30 * 24 * 60 * 60 * 1000)
      : new Date(0);
    const recentPurchaseCutoff = latestPurchase
      ? new Date(latestPurchase.timestamp.getTime() - 30 * 24 * 60 * 60 * 1000)
      : new Date(0);

    const [recentSalesAgg, recentPurchasesAgg] = await Promise.all([
      prisma.sales.aggregate({
        where: { timestamp: { gte: recentSaleCutoff } },
        _sum: { totalAmount: true },
        _count: { saleId: true },
      }),
      prisma.purchases.aggregate({
        where: { timestamp: { gte: recentPurchaseCutoff } },
        _sum: { totalCost: true },
      }),
    ]);

    res.json({
      popularProducts,
      salesSummary,
      purchaseSummary,
      expenseSummary,
      expenseByCategorySummary,
      stats: {
        totalSalesAmount: salesAggregate._sum.totalAmount ?? 0,
        totalSalesCount: salesAggregate._count.saleId,
        totalPurchaseCost: purchasesAggregate._sum.totalCost ?? 0,
        totalPurchaseCount: purchasesAggregate._count.purchaseId,
        totalExpenses: expensesAggregate._sum.amount ?? 0,
        totalExpenseCount: expensesAggregate._count.expenseId,
        productCount,
        userCount,
        lowStockCount,
        totalStockValue,
        last30DaysSales: recentSalesAgg._sum.totalAmount ?? 0,
        last30DaysSalesCount: recentSalesAgg._count.saleId,
        last30DaysPurchases: recentPurchasesAgg._sum.totalCost ?? 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
