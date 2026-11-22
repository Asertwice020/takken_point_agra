import { body } from "express-validator";
import { handleValidation } from "../../../middlewares/validate.middleware.js";

// * Accepts "98765 43210", "+91 9876543210", "09876543210" and stores 10 digits
const normalizePhone = (value) => String(value ?? "").replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "");

export const validateSaveProfile = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 60 }).withMessage("Name is too long"),
  body("phone").customSanitizer(normalizePhone).matches(/^[6-9]\d{9}$/).withMessage("Enter a valid 10-digit mobile number"),
  handleValidation,
];

export const validateAdminLogin = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidation,
];
