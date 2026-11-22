import { validationResult } from "express-validator";
import { ERROR_CODES } from "../constants.js";
import { ApiError } from "../utils/basic/ApiError.js";

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, "Validation Failed", errors.array()).setErrorCode(ERROR_CODES.VALIDATION_FAILED);
  next();
};
