import { body, param } from "express-validator";
import { handleValidation } from "../../../middlewares/validate.middleware.js";

const bookingIdParam = param("id").isInt({ min: 1 }).withMessage("Valid booking id is required").toInt();

export const validateCreateBooking = [
  body("gameId").isInt({ min: 1 }).withMessage("Valid gameId is required").toInt(),
  body("bookingDate").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Date must be YYYY-MM-DD"),
  body("startTime").matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("Start time must be HH:MM"),
  body("durationMinutes").isInt({ min: 30, max: 240 }).withMessage("Valid duration is required").toInt(),
  handleValidation,
];

export const validateBookingId = [bookingIdParam, handleValidation];

export const validateMarkPaid = [
  bookingIdParam,
  body("utr").trim().matches(/^\d{12}$/).withMessage("UTR must be exactly 12 digits"),
  handleValidation,
];

export const validateRescheduleBooking = [
  bookingIdParam,
  body("bookingDate").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Date must be YYYY-MM-DD"),
  body("startTime").matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("Start time must be HH:MM"),
  handleValidation,
];
