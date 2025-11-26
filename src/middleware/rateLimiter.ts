import rateLimit from "express-rate-limit";

// General rate limiter: 100 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: "Too many requests, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks
  skip: (req) => req.path === "/health" || req.path === "/ready",
  // Use request ID header in rate limit key for better tracking
  keyGenerator: (req) => {
    return (
      req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
      req.ip ||
      "unknown"
    );
  },
});

// Auth rate limiter: 10 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    error: "Too many authentication attempts, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return (
      req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
      req.ip ||
      "unknown"
    );
  },
});

// API rate limiter: 30 requests per minute (for heavy API endpoints)
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    error: "Too many API requests, please try again later.",
    retryAfter: "1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return (
      req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
      req.ip ||
      "unknown"
    );
  },
});
