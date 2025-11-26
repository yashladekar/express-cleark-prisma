import { Router, Request, Response } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import prisma from "../lib/prisma";
import logger from "../lib/logger";
import { validate, updateUserSchema } from "../middleware/validate";

const router = Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
      logger.error("Error fetching user", { error: err, requestId: req.requestId });
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: Updated user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.patch(
  "/me",
  requireAuth(),
  validate(updateUserSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const auth = getAuth(req);
      const userId = auth.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { firstName, lastName, plan } = req.body;

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
      logger.error("Error updating user", { error: err, requestId: req.requestId });
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
