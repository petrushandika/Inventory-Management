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
    const { productId, image, name, price, rating, stockQuantity } = req.body;

    if (!name || price == null || stockQuantity == null) {
      res.status(400).json({ message: "name, price, and stockQuantity are required" });
      return;
    }

    const product = await prisma.products.create({
      data: {
        productId: productId || randomUUID(),
        image,
        name: name.trim(),
        price: Number(price),
        rating: rating != null ? Number(rating) : undefined,
        stockQuantity: Number(stockQuantity),
      },
    });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};
