import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { randomUUID } from "crypto";

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const categories = await prisma.categories.findMany({
      where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
      include: { _count: { select: { Products: true } } },
      orderBy: { name: "asc" },
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, color } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ message: "Category name is required." });
      return;
    }
    const category = await prisma.categories.create({
      data: { categoryId: randomUUID(), name: name.trim(), description: description?.trim(), color: color || "#3b82f6" },
    });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const { name, description, color } = req.body;
    const category = await prisma.categories.update({
      where: { categoryId },
      data: {
        ...(name?.trim() && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(color && { color }),
      },
    });
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { categoryId } = req.params;
    await prisma.categories.delete({ where: { categoryId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
