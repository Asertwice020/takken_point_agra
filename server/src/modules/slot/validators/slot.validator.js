import { query } from "express-validator";
import { handleValidation } from "../../../middlewares/validate.middleware.js";

export const validateGetSlots = [
  query("gameId").isInt({ min: 1 }).withMessage("Valid gameId is required").toInt(),
  query("date").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Date must be YYYY-MM-DD"),
  query("duration").isInt({ min: 30, max: 240 }).withMessage("Valid duration is required").toInt(),
  handleValidation,
];
