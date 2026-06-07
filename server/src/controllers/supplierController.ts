import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { randomUUID } from "crypto";

export const getSuppliers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const suppliers = await prisma.suppliers.findMany({
      where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
      include: { _count: { select: { Purchases: true } } },
      orderBy: { name: "asc" },
    });
    res.json(suppliers);
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ message: "Supplier name is required." });
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ message: "Invalid email format." });
      return;
    }
    const supplier = await prisma.suppliers.create({
      data: {
        supplierId: randomUUID(),
        name: name.trim(),
        email: email?.trim().toLowerCase() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
      },
    });
    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { supplierId } = req.params;
    const { name, email, phone, address } = req.body;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ message: "Invalid email format." });
      return;
    }
    const supplier = await prisma.suppliers.update({
      where: { supplierId },
      data: {
        ...(name?.trim() && { name: name.trim() }),
        ...(email !== undefined && { email: email?.trim().toLowerCase() || null }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(address !== undefined && { address: address?.trim() || null }),
      },
    });
    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { supplierId } = req.params;
    await prisma.suppliers.delete({ where: { supplierId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
