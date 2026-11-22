import { env } from "../../../../config/env.js";
import { ERROR_CODES } from "../../../../constants.js";
import { ApiError } from "../../../../utils/basic/ApiError.js";
import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";
import { getSessionKey, isSamePassword, signOwnerToken } from "../../logic/ownerSession.js";

// * Owner login: an email from OWNER_EMAILS plus OWNER_PASS (both in .env). Same error for either mistake.
export const loginOwner = asyncHandler(async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const isPasswordOk = isSamePassword(req.body.password, env.ownerPass);
  const isEmailOk = env.ownerEmails.includes(email);
  if (!isPasswordOk || !isEmailOk) throw new ApiError(401, "Wrong email or password").setErrorCode(ERROR_CODES.UNAUTHORIZED);

  const { token, expiresAt } = signOwnerToken({ email }, getSessionKey(env.ownerPass));
  res.json(new ApiResponse(200, "Logged in", { token, expiresAt, email }));
});
