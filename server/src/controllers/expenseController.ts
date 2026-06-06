import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

export const getExpensesByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const raw = await prisma.expenseByCategory.findMany({
      orderBy: { date: "desc" },
    });

    const expenseByCategorySummary = raw.map((item) => ({
      ...item,
      amount: item.amount.toString(),
    }));

    res.json(expenseByCategorySummary);
  } catch (error) {
    next(error);
  }
};
