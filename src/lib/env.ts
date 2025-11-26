import { z, ZodIssue } from "zod";
import logger from "./logger";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Clerk Authentication
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1),

  // Server
  PORT: z.string().default("3001"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Frontend URL (for CORS)
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

export const validateEnv = (): Env => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues.map(
      (err: ZodIssue) => `  - ${err.path.join(".")}: ${err.message}`
    );
    logger.error("Environment validation failed:\n" + errors.join("\n"));
    process.exit(1);
  }

  return result.data;
};

export const env = validateEnv();

export default env;
