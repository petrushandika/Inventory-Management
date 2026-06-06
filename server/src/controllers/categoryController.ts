import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { randomUUID } from "crypto";

export const getCategories = async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const categories = await prisma.categories.findMany({
    where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
    include: { _count: { select: { Products: true } } },
    orderBy: { name: "asc" },
  });
  res.json(categories);
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, description, color } = req.body;
  const category = await prisma.categories.create({
    data: { categoryId: randomUUID(), name, description, color: color || "#3b82f6" },
  });
  res.status(201).json(category);
};

export const updateCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const { name, description, color } = req.body;
  const category = await prisma.categories.update({
    where: { categoryId },
    data: { name, description, color },
  });
  res.json(category);
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  await prisma.categories.delete({ where: { categoryId } });
  res.status(204).send();
};
