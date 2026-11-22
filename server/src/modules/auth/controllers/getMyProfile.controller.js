import { pool } from "../../../config/db.js";
import { env } from "../../../config/env.js";
import { ApiResponse } from "../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../utils/basic/asyncHandler.js";

export const getMyProfile = asyncHandler(async (req, res) => {
  const { rows: [profile] } = await pool.query("SELECT id, email, name, phone FROM profiles WHERE id = $1", [req.user.id]);
  res.json(new ApiResponse(200, "Profile", { profile: profile || null, isOwner: env.ownerEmails.includes(req.user.email) }));
});
