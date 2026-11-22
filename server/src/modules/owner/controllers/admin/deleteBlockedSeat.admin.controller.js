import { pool } from "../../../../config/db.js";
import { ERROR_CODES } from "../../../../constants.js";
import { ApiError } from "../../../../utils/basic/ApiError.js";
import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";

export const deleteBlockedSeat = asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query("DELETE FROM blocked_seats WHERE id = $1", [req.params.id]);
  if (!rowCount) throw new ApiError(404, "Blocked seat not found").setErrorCode(ERROR_CODES.NOT_FOUND);
  res.json(new ApiResponse(200, "Block removed"));
});
