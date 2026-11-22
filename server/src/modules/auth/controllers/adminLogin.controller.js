import { env } from "../../../config/env.js";
import { ERROR_CODES } from "../../../constants.js";
import { ApiError } from "../../../utils/basic/ApiError.js";
import { ApiResponse } from "../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../utils/basic/asyncHandler.js";
import { generateAdminToken } from "../../../utils/security/adminToken.util.js";

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = (email || "").trim().toLowerCase();

  if (!env.ownerEmails.includes(normalizedEmail)) {
    throw new ApiError(401, "Invalid email or password").setErrorCode(ERROR_CODES.UNAUTHORIZED);
  }

  if (!env.ownerPass) {
    throw new ApiError(500, "OWNER_PASS is not configured in server environment");
  }

  if (password !== env.ownerPass) {
    throw new ApiError(401, "Invalid email or password").setErrorCode(ERROR_CODES.UNAUTHORIZED);
  }

  const token = generateAdminToken(normalizedEmail);
  res.json(
    new ApiResponse(200, "Admin login successful", {
      token,
      user: {
        email: normalizedEmail,
        isOwner: true,
      },
    })
  );
});
