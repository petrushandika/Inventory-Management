import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { prisma } from "../lib/prisma.js";

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const search = req.query.search?.toString();
    const role = req.query.role?.toString() as any;
    const users = await prisma.users.findMany({
      where: {
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
        ...(role && role !== "All" ? { role } : {}),
      },
      orderBy: { name: "asc" },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, role, image } = req.body;
    if (!name || !email) {
      res.status(400).json({ message: "name and email are required" });
      return;
    }
    const user = await prisma.users.create({
      data: {
        userId: randomUUID(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role ?? "Staff",
        image: image ?? null,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { name, email, role, image } = req.body;
    const user = await prisma.users.update({
      where: { userId },
      data: {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.trim().toLowerCase() }),
        ...(role && { role }),
        ...(image !== undefined && { image }),
      },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    await prisma.users.delete({ where: { userId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
