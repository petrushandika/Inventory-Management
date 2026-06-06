import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

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
    ] = await Promise.all([
      prisma.products.findMany({
        take: 15,
        orderBy: { stockQuantity: "desc" },
      }),
      prisma.salesSummary.findMany({
        take: 5,
        orderBy: { date: "desc" },
      }),
      prisma.purchaseSummary.findMany({
        take: 5,
        orderBy: { date: "desc" },
      }),
      prisma.expenseSummary.findMany({
        take: 5,
        orderBy: { date: "desc" },
      }),
      prisma.expenseByCategory.findMany({
        take: 5,
        orderBy: { date: "desc" },
      }),
    ]);

    const expenseByCategorySummary = expenseByCategoryRaw.map((item) => ({
      ...item,
      amount: item.amount.toString(),
    }));

    res.json({
      popularProducts,
      salesSummary,
      purchaseSummary,
      expenseSummary,
      expenseByCategorySummary,
    });
  } catch (error) {
    next(error);
  }
};
