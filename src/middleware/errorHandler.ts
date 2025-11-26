import { Request, Response, NextFunction } from "express";
import logger from "../lib/logger";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

// Custom error class for operational errors
export class ApiError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 Not Found handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
    statusCode: 404,
  });
};

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const requestId = req.requestId || "unknown";

  // Log error with context
  logger.error(`Error: ${message}`, {
    statusCode,
    path: req.path,
    method: req.method,
    requestId,
    code: err.code,
    stack: err.stack,
    isOperational: err.isOperational,
  });

  // Send response based on environment
  const response: Record<string, unknown> = {
    error: message,
    statusCode,
    requestId,
  };

  if (err.code) {
    response.code = err.code;
  }

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
