import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { prisma } from "../lib/prisma.js";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const search = req.query.search?.toString();
    const products = await prisma.products.findMany({
      where: search
        ? { name: { contains: search, mode: "insensitive" } }
        : undefined,
      orderBy: { name: "asc" },
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, image, name, price, rating, stockQuantity, categoryId } = req.body;

    if (!name?.trim()) {
      res.status(400).json({ message: "Product name is required." });
      return;
    }
    if (price == null || isNaN(Number(price)) || Number(price) < 0) {
      res.status(400).json({ message: "Price must be a non-negative number." });
      return;
    }
    if (stockQuantity == null || isNaN(Number(stockQuantity)) || Number(stockQuantity) < 0) {
      res.status(400).json({ message: "Stock quantity must be a non-negative number." });
      return;
    }

    const product = await prisma.products.create({
      data: {
        productId: productId || randomUUID(),
        image: image ?? null,
        name: name.trim(),
        price: Number(price),
        rating: rating != null ? Math.min(5, Math.max(0, Number(rating))) : undefined,
        stockQuantity: Math.floor(Number(stockQuantity)),
        categoryId: categoryId ?? null,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    const { image, name, price, rating, stockQuantity, categoryId } = req.body;

    const product = await prisma.products.update({
      where: { productId },
      data: {
        ...(image !== undefined && { image }),
        ...(name?.trim() && { name: name.trim() }),
        ...(price != null && !isNaN(Number(price)) && { price: Math.max(0, Number(price)) }),
        ...(rating != null && { rating: Math.min(5, Math.max(0, Number(rating))) }),
        ...(stockQuantity != null && { stockQuantity: Math.max(0, Math.floor(Number(stockQuantity))) }),
        ...(categoryId !== undefined && { categoryId: categoryId ?? null }),
      },
    });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    await prisma.products.delete({ where: { productId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
