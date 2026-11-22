import { pool } from "../../../config/db.js";
import { ApiResponse } from "../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../utils/basic/asyncHandler.js";

export const saveMyProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const { rows: [profile] } = await pool.query(
    `INSERT INTO profiles (id, email, name, phone) VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone
     RETURNING id, email, name, phone`,
    [req.user.id, req.user.email, name, phone]);
  res.json(new ApiResponse(200, "Profile saved", { profile }));
});
