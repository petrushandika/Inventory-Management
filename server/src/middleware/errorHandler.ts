import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Prisma "record not found" → 404
  if (err?.code === "P2025") {
    res.status(404).json({ message: "Record not found" });
    return;
  }
  // Prisma unique constraint violation → 409
  if (err?.code === "P2002") {
    res.status(409).json({ message: "A record with this value already exists" });
    return;
  }

  console.error(`[${new Date().toISOString()}] ${err.stack ?? err}`);
  res.status(500).json({
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { error: err.message }),
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
};
