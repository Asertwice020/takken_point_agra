import { ERROR_CODES } from "../../../../constants.js";
import { ApiError } from "../../../../utils/basic/ApiError.js";
import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";
import { withTransaction } from "../../../../utils/handlers/withTransaction.js";

// * Replaces the whole list of slot lengths and prices. Existing bookings keep the price they paid.
export const setGameDurations = asyncHandler(async (req, res) => {
  const { durations } = req.body;
  await withTransaction(async (client) => {
    const { rowCount } = await client.query("SELECT 1 FROM games WHERE id = $1", [req.params.id]);
    if (!rowCount) throw new ApiError(404, "Game not found").setErrorCode(ERROR_CODES.GAME_UNAVAILABLE);
    await client.query("DELETE FROM game_durations WHERE game_id = $1", [req.params.id]);
    for (const { minutes, price } of durations) {
      await client.query("INSERT INTO game_durations (game_id, minutes, price) VALUES ($1, $2, $3)", [req.params.id, minutes, price]);
    }
  });
  res.json(new ApiResponse(200, "Durations saved", { gameId: req.params.id, durations }));
});
