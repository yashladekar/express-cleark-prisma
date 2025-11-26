import { z, ZodIssue } from "zod";
import { Request, Response, NextFunction } from "express";

// Common validation schemas
export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  plan: z.enum(["free", "pro", "enterprise"]).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Generic validation middleware factory
export const validate =
  <T extends z.ZodSchema>(schema: T) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((err: ZodIssue) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
      return;
    }

    req.body = result.data;
    next();
  };
