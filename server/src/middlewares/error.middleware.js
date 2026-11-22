import { env } from "../config/env.js";

export const errorMiddleware = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) console.error(error);
  res.status(statusCode).json({
    success: false,
    statusCode,
    message: statusCode >= 500 ? "Internal Server Error" : error.message,
    errorCode: error.errorCode || null,
    errors: error.errors || [],
    debuggingTip: env.nodeEnv === "production" ? null : error.debuggingTip || null,
  });
};
