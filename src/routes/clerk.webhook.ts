import { Router, Request, Response, raw } from "express";
import { Webhook } from "svix";
import prisma from "../lib/prisma";
import logger from "../lib/logger";

const router = Router();

interface WebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
}

// Webhook endpoint must use raw body for signature verification
router.post(
  "/",
  raw({ type: "application/json" }),
  async (req: Request, res: Response): Promise<void> => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logger.error("CLERK_WEBHOOK_SECRET is not set");
      res.status(500).json({ error: "Webhook secret not configured" });
      return;
    }

    const svixId = req.headers["svix-id"] as string;
    const svixTimestamp = req.headers["svix-timestamp"] as string;
    const svixSignature = req.headers["svix-signature"] as string;

    if (!svixId || !svixTimestamp || !svixSignature) {
      logger.warn("Missing Svix headers in webhook request");
      res.status(400).json({ error: "Missing required headers" });
      return;
    }

    let event: WebhookEvent;

    try {
      const wh = new Webhook(webhookSecret);
      const body =
        typeof req.body === "string" ? req.body : req.body.toString();
      event = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      logger.error("Webhook signature verification failed", { error: err });
      res.status(400).json({ error: "Invalid webhook signature" });
      return;
    }

    const { type, data } = event;
    logger.info(`Processing webhook event: ${type}`);

    try {
      switch (type) {
        case "user.created": {
          const primaryEmail = data.email_addresses[0]?.email_address;

          if (!primaryEmail) {
            logger.error("No email address found in user.created event");
            res.status(400).json({ error: "No email address provided" });
            return;
          }

          await prisma.user.create({
            data: {
              clerkId: data.id,
              email: primaryEmail,
              firstName: data.first_name,
              lastName: data.last_name,
              imageUrl: data.image_url,
            },
          });

          logger.info(`User created: ${data.id}`);
          break;
        }

        case "user.updated": {
          const updatedEmail = data.email_addresses[0]?.email_address;

          await prisma.user.update({
            where: { clerkId: data.id },
            data: {
              email: updatedEmail,
              firstName: data.first_name,
              lastName: data.last_name,
              imageUrl: data.image_url,
            },
          });

          logger.info(`User updated: ${data.id}`);
          break;
        }

        case "user.deleted": {
          await prisma.user.delete({
            where: { clerkId: data.id },
          });

          logger.info(`User deleted: ${data.id}`);
          break;
        }

        default:
          logger.info(`Unhandled webhook event type: ${type}`);
      }

      res.status(200).json({ received: true });
    } catch (err) {
      logger.error("Error processing webhook event", { error: err, type });
      res.status(500).json({ error: "Error processing webhook" });
    }
  }
);

export default router;
