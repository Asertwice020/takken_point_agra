import { env } from "../config/env.js";
import { ERROR_CODES } from "../constants.js";
import { getSessionKey, verifyOwnerToken } from "../modules/owner/logic/ownerSession.js";
import { ApiError } from "../utils/basic/ApiError.js";

const sessionKey = getSessionKey(env.ownerPass);

// * Every owner route needs the token from the admin login (customers' Supabase tokens never work here)
export const requireOwnerSession = (req, res, next) => {
  const header = req.headers.authorization || "";
  const owner = verifyOwnerToken(header.startsWith("Bearer ") ? header.slice(7) : null, sessionKey);
  if (!owner || !env.ownerEmails.includes(owner.email)) throw new ApiError(401, "Owner login required").setErrorCode(ERROR_CODES.UNAUTHORIZED);
  req.owner = owner;
  next();
};
