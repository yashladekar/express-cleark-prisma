import winston from "winston";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let log = `${timestamp} [${level}]: ${message}`;
  
  // Add metadata if present
  if (Object.keys(metadata).length > 0) {
    log += ` ${JSON.stringify(metadata)}`;
  }
  
  return log;
});

// Custom levels with http for Morgan
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Color scheme for console output
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "cyan",
};

winston.addColors(colors);

// Determine log level based on environment
const getLogLevel = (): string => {
  const env = process.env.NODE_ENV || "development";
  return env === "production" ? "info" : "debug";
};

export const logger = winston.createLogger({
  levels,
  level: getLogLevel(),
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat
      ),
    }),
  ],
  // Prevent unhandled exceptions from crashing the app
  exitOnError: false,
});

export default logger;
