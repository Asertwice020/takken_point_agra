import { pool } from "../../../../config/db.js";
import { ERROR_CODES } from "../../../../constants.js";
import { ApiError } from "../../../../utils/basic/ApiError.js";
import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";

// * Partial update. Hiding a game (isActive false) keeps all existing bookings intact.
export const updateGame = asyncHandler(async (req, res) => {
  const { name, stations, isActive } = req.body;
  try {
    const { rows: [game] } = await pool.query(
      `UPDATE games SET name = COALESCE($1, name), stations = COALESCE($2, stations), is_active = COALESCE($3, is_active)
       WHERE id = $4 RETURNING id, name, stations, is_active`, [name, stations, isActive, req.params.id]);
    if (!game) throw new ApiError(404, "Game not found").setErrorCode(ERROR_CODES.GAME_UNAVAILABLE);
    res.json(new ApiResponse(200, "Game updated", { game }));
  } catch (error) {
    if (error.code === "23505") throw new ApiError(409, "A game with this name already exists").setErrorCode(ERROR_CODES.VALIDATION_FAILED);
    throw error;
  }
});
