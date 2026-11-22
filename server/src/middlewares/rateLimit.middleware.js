import rateLimit from "express-rate-limit";
import { ERROR_CODES } from "../constants.js";

const buildLimiter = (limit, windowMs = 60_000) =>
  rateLimit({
    windowMs, limit, standardHeaders: true, legacyHeaders: false,
    message: { success: false, statusCode: 429, message: "Too many requests, please slow down", errorCode: ERROR_CODES.RATE_LIMITED },
  });

export const bookingRateLimit = buildLimiter(10);
export const profileRateLimit = buildLimiter(10);
export const statusRateLimit = buildLimiter(40);
export const ownerLoginRateLimit = buildLimiter(8, 15 * 60_000); // 8 attempts per 15 minutes
