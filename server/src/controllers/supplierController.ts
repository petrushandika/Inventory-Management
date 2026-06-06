import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { randomUUID } from "crypto";

export const getSuppliers = async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const suppliers = await prisma.suppliers.findMany({
    where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
    include: { _count: { select: { Purchases: true } } },
    orderBy: { name: "asc" },
  });
  res.json(suppliers);
};

export const createSupplier = async (req: Request, res: Response) => {
  const { name, email, phone, address } = req.body;
  const supplier = await prisma.suppliers.create({
    data: { supplierId: randomUUID(), name, email, phone, address },
  });
  res.status(201).json(supplier);
};

export const updateSupplier = async (req: Request, res: Response) => {
  const { supplierId } = req.params;
  const { name, email, phone, address } = req.body;
  const supplier = await prisma.suppliers.update({
    where: { supplierId },
    data: { name, email, phone, address },
  });
  res.json(supplier);
};

export const deleteSupplier = async (req: Request, res: Response) => {
  const { supplierId } = req.params;
  await prisma.suppliers.delete({ where: { supplierId } });
  res.status(204).send();
};
