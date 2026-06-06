import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await prisma.users.findMany({ orderBy: { name: "asc" } });
    res.json(users);
  } catch (error) {
    next(error);
  }
};
