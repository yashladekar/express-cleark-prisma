import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { clerkMiddleware } from "@clerk/express";
import logger from "./lib/logger";
import prisma from "./lib/prisma";
import env from "./lib/env";
import swaggerSpec from "./lib/swagger";
import { generalLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import requestIdMiddleware from "./middleware/requestId";
import clerkWebhookRouter from "./routes/clerk.webhook";
import userRouter from "./routes/user";

const app = express();
const PORT = env.PORT || 3001;

// Trust proxy - required for rate limiting behind reverse proxy
app.set("trust proxy", 1);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Request ID for distributed tracing
app.use(requestIdMiddleware);

// Response compression
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
  })
);

// HTTP request logging
const morganFormat = env.NODE_ENV === "production" ? "combined" : "dev";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
    skip: (req) => req.url === "/health" || req.url === "/ready",
  })
);

// Rate limiting
app.use(generalLimiter);

// Clerk webhook route MUST be before express.json() middleware
// because it needs the raw body for signature verification
app.use("/api/webhooks/clerk", clerkWebhookRouter);

// Body parsing middleware (after webhook route)
app.use(express.json({ limit: "10kb" })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Clerk authentication middleware
app.use(clerkMiddleware());

// API Documentation
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: "Express Prisma Clerk API Documentation",
  })
);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

/**
 * @swagger
 * /ready:
 *   get:
 *     summary: Readiness check with database connection
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is ready and database is connected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       503:
 *         description: Server is not ready
 */
app.get("/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: "not ready",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

// API routes
app.use("/api/users", userRouter);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      await prisma.$disconnect();
      logger.info("Database connection closed");
      process.exit(0);
    } catch (err) {
      logger.error("Error during shutdown", { error: err });
      process.exit(1);
    }
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error("Could not close connections in time, forcing shutdown");
    process.exit(1);
  }, 30000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default app;
