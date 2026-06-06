import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`[${new Date().toISOString()}] ${err.stack}`);
  res.status(500).json({
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { error: err.message }),
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
};
