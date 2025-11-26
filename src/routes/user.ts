import { Router, Request, Response } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import prisma from "../lib/prisma";
import logger from "../lib/logger";

const router = Router();

// Get current authenticated user
router.get(
  "/me",
  requireAuth(),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const auth = getAuth(req);
      const userId = auth.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json(user);
    } catch (err) {
      logger.error("Error fetching user", { error: err });
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update current user profile
router.patch(
  "/me",
  requireAuth(),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const auth = getAuth(req);
      const userId = auth.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { firstName, lastName, plan } = req.body;

      // Validate plan if provided
      const allowedPlans = ["free", "pro", "enterprise"];
      if (plan && !allowedPlans.includes(plan)) {
        res.status(400).json({
          error: "Invalid plan. Allowed values: free, pro, enterprise",
        });
        return;
      }

      const user = await prisma.user.update({
        where: { clerkId: userId },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(plan && { plan }),
        },
      });

      res.json(user);
    } catch (err) {
      logger.error("Error updating user", { error: err });
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
