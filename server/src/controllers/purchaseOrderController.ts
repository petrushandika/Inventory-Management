import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../lib/prisma.js";
import { v4 as uuidv4 } from "uuid";

export const getPurchaseOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = getPrisma();
    const { status } = req.query;
    const orders = await prisma.purchaseOrders.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        supplier: { select: { supplierId: true, name: true } },
        items: {
          include: {
            product: { select: { productId: true, name: true, stockQuantity: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getPurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = getPrisma();
    const order = await prisma.purchaseOrders.findUnique({
      where: { orderId: req.params.orderId },
      include: {
        supplier: true,
        items: {
          include: {
            product: { select: { productId: true, name: true, stockQuantity: true, price: true } },
          },
        },
      },
    });
    if (!order) return res.status(404).json({ message: "Purchase order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const createPurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = getPrisma();
    const { supplierId, notes, items = [] } = req.body;

    const totalCost = items.reduce(
      (sum: number, item: { quantity: number; unitCost: number }) =>
        sum + item.quantity * item.unitCost,
      0
    );

    const order = await prisma.purchaseOrders.create({
      data: {
        orderId: uuidv4(),
        supplierId: supplierId || null,
        notes: notes || null,
        totalCost,
        items: {
          create: items.map((item: { productId: string; quantity: number; unitCost: number }) => ({
            itemId: uuidv4(),
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })),
        },
      },
      include: {
        supplier: { select: { supplierId: true, name: true } },
        items: {
          include: {
            product: { select: { productId: true, name: true, stockQuantity: true } },
          },
        },
      },
    });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

export const updatePurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = getPrisma();
    const { orderId } = req.params;
    const { status, notes, supplierId } = req.body;

    const existing = await prisma.purchaseOrders.findUnique({
      where: { orderId },
      include: { items: true },
    });
    if (!existing) return res.status(404).json({ message: "Purchase order not found" });

    // When receiving, increment stock for all items atomically
    if (status === "Received" && existing.status !== "Received") {
      await prisma.$transaction([
        ...existing.items.map((item) =>
          prisma.products.update({
            where: { productId: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          })
        ),
        prisma.purchaseOrders.update({
          where: { orderId },
          data: {
            ...(status !== undefined && { status }),
            ...(notes !== undefined && { notes }),
            ...(supplierId !== undefined && { supplierId }),
          },
        }),
      ]);

      const updated = await prisma.purchaseOrders.findUnique({
        where: { orderId },
        include: {
          supplier: { select: { supplierId: true, name: true } },
          items: {
            include: {
              product: { select: { productId: true, name: true, stockQuantity: true } },
            },
          },
        },
      });
      return res.json(updated);
    }

    const updated = await prisma.purchaseOrders.update({
      where: { orderId },
      data: {
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        ...(supplierId !== undefined && { supplierId }),
      },
      include: {
        supplier: { select: { supplierId: true, name: true } },
        items: {
          include: {
            product: { select: { productId: true, name: true, stockQuantity: true } },
          },
        },
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deletePurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = getPrisma();
    const { orderId } = req.params;
    const order = await prisma.purchaseOrders.findUnique({ where: { orderId } });
    if (!order) return res.status(404).json({ message: "Purchase order not found" });
    if (order.status !== "Draft" && order.status !== "Cancelled") {
      return res.status(400).json({ message: "Only Draft or Cancelled orders can be deleted" });
    }
    await prisma.purchaseOrders.delete({ where: { orderId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
