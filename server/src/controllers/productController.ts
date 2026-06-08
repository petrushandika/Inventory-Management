import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { getPrisma } from "../lib/prisma.js";
import { uploadImage, deleteImage, publicIdFromUrl } from "../lib/cloudinary.js";

const isBase64Image = (s: string) => s.startsWith("data:image/");
const isCloudinaryUrl = (s: string) => s.includes("res.cloudinary.com");

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const prisma = getPrisma();
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
    const prisma = getPrisma();
    const { productId, image, name, price, rating, stockQuantity, minStock, categoryId } = req.body;

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
    if (minStock != null && (isNaN(Number(minStock)) || Number(minStock) < 0)) {
      res.status(400).json({ message: "Minimum stock must be a non-negative number." });
      return;
    }

    let imageUrl: string | null = null;
    if (image && isBase64Image(image)) {
      imageUrl = await uploadImage(image, "inventory/products");
    } else if (image) {
      imageUrl = image;
    }

    const product = await prisma.products.create({
      data: {
        productId: productId || randomUUID(),
        image: imageUrl,
        name: name.trim(),
        price: Number(price),
        rating: rating != null ? Math.min(5, Math.max(0, Number(rating))) : undefined,
        stockQuantity: Math.floor(Number(stockQuantity)),
        minStock: minStock != null ? Math.floor(Number(minStock)) : 20,
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
    const prisma = getPrisma();
    const { productId } = req.params;
    const { image, name, price, rating, stockQuantity, minStock, categoryId } = req.body;

    let imageUrl: string | undefined = undefined;

    if (image !== undefined) {
      if (image === null || image === "") {
        // caller wants to remove image — delete old one from Cloudinary if present
        const existing = await prisma.products.findUnique({ where: { productId }, select: { image: true } });
        if (existing?.image && isCloudinaryUrl(existing.image)) {
          const pid = publicIdFromUrl(existing.image);
          if (pid) await deleteImage(pid).catch(() => {});
        }
        imageUrl = "";
      } else if (isBase64Image(image)) {
        // new base64 image — upload and delete old
        const existing = await prisma.products.findUnique({ where: { productId }, select: { image: true } });
        if (existing?.image && isCloudinaryUrl(existing.image)) {
          const pid = publicIdFromUrl(existing.image);
          if (pid) await deleteImage(pid).catch(() => {});
        }
        imageUrl = await uploadImage(image, "inventory/products");
      } else {
        imageUrl = image;
      }
    }

    const product = await prisma.products.update({
      where: { productId },
      data: {
        ...(imageUrl !== undefined && { image: imageUrl || null }),
        ...(name?.trim() && { name: name.trim() }),
        ...(price != null && !isNaN(Number(price)) && { price: Math.max(0, Number(price)) }),
        ...(rating != null && { rating: Math.min(5, Math.max(0, Number(rating))) }),
        ...(stockQuantity != null && { stockQuantity: Math.max(0, Math.floor(Number(stockQuantity))) }),
        ...(minStock != null && { minStock: Math.max(0, Math.floor(Number(minStock))) }),
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
    const prisma = getPrisma();
    const { productId } = req.params;

    // delete image from Cloudinary before removing record
    const product = await prisma.products.findUnique({ where: { productId }, select: { image: true } });
    if (product?.image && isCloudinaryUrl(product.image)) {
      const pid = publicIdFromUrl(product.image);
      if (pid) await deleteImage(pid).catch(() => {});
    }

    await prisma.products.delete({ where: { productId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
