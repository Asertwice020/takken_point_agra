import { env } from "../config/env.js";
import { supabaseAuthClient } from "../config/supabase.js";
import { ERROR_CODES } from "../constants.js";
import { ApiError } from "../utils/basic/ApiError.js";
import { asyncHandler } from "../utils/basic/asyncHandler.js";
import { verifyAdminToken } from "../utils/security/adminToken.util.js";

// ==========================================
// * AUTH GATES
// ==========================================
export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new ApiError(401, "Login required").setErrorCode(ERROR_CODES.UNAUTHORIZED);

  const adminPayload = verifyAdminToken(token);
  if (adminPayload) {
    req.user = { id: adminPayload.sub || "admin", email: adminPayload.email, isOwner: true };
    return next();
  }

  const { data, error } = await supabaseAuthClient.auth.getUser(token);
  if (error || !data?.user?.email) throw new ApiError(401, "Session expired, please log in again").setErrorCode(ERROR_CODES.UNAUTHORIZED);

  req.user = { id: data.user.id, email: data.user.email.toLowerCase() };
  next();
});

export const requireOwner = (req, res, next) => {
  if (!env.ownerEmails.includes(req.user.email)) throw new ApiError(403, "Owner access only").setErrorCode(ERROR_CODES.FORBIDDEN);
  next();
};
