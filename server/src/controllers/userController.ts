import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { getPrisma } from "../lib/prisma.js";
import { uploadImage, deleteImage, publicIdFromUrl } from "../lib/cloudinary.js";

const isBase64Image = (s: string) => s.startsWith("data:image/");
const isCloudinaryUrl = (s: string) => s.includes("res.cloudinary.com");

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const prisma = getPrisma();
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
    const prisma = getPrisma();
    const { name, email, role, image } = req.body;
    if (!name || !email) {
      res.status(400).json({ message: "name and email are required" });
      return;
    }

    let imageUrl: string | null = null;
    if (image && isBase64Image(image)) {
      imageUrl = await uploadImage(image, "inventory/users");
    } else if (image) {
      imageUrl = image;
    }

    const user = await prisma.users.create({
      data: {
        userId: randomUUID(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role ?? "Staff",
        image: imageUrl,
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
    const prisma = getPrisma();
    const { userId } = req.params;
    const { name, email, role, image } = req.body;

    let imageUrl: string | undefined = undefined;

    if (image !== undefined) {
      if (image === null || image === "") {
        // Remove image — delete old one from Cloudinary
        const existing = await prisma.users.findUnique({ where: { userId }, select: { image: true } });
        if (existing?.image && isCloudinaryUrl(existing.image)) {
          const pid = publicIdFromUrl(existing.image);
          if (pid) await deleteImage(pid).catch(() => {});
        }
        imageUrl = "";
      } else if (isBase64Image(image)) {
        // Upload new image — delete old one first
        const existing = await prisma.users.findUnique({ where: { userId }, select: { image: true } });
        if (existing?.image && isCloudinaryUrl(existing.image)) {
          const pid = publicIdFromUrl(existing.image);
          if (pid) await deleteImage(pid).catch(() => {});
        }
        imageUrl = await uploadImage(image, "inventory/users");
      } else {
        imageUrl = image;
      }
    }

    const user = await prisma.users.update({
      where: { userId },
      data: {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.trim().toLowerCase() }),
        ...(role && { role }),
        ...(imageUrl !== undefined && { image: imageUrl || null }),
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
    const prisma = getPrisma();
    const { userId } = req.params;
    // Delete profile image from Cloudinary if present
    const existing = await prisma.users.findUnique({ where: { userId }, select: { image: true } });
    if (existing?.image && isCloudinaryUrl(existing.image)) {
      const pid = publicIdFromUrl(existing.image);
      if (pid) await deleteImage(pid).catch(() => {});
    }
    await prisma.users.delete({ where: { userId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
