import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username?.trim() || !password) {
      res.status(400).json({ message: "Username and password are required." });
      return;
    }

    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { username: username.trim().toLowerCase() },
          { email: username.trim().toLowerCase() },
        ],
      },
    });

    if (!user || !user.password) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (error) {
    next(error);
  }
};
