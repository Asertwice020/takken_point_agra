import { ERROR_CODES } from "../../../../constants.js";
import { ApiError } from "../../../../utils/basic/ApiError.js";
import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";
import { withTransaction } from "../../../../utils/handlers/withTransaction.js";

export const createGame = asyncHandler(async (req, res) => {
  const { name, stations = 2, durations } = req.body;
  try {
    const game = await withTransaction(async (client) => {
      const { rows: [created] } = await client.query(
        "INSERT INTO games (name, stations) VALUES ($1, $2) RETURNING id, name, stations, is_active", [name, stations]);
      for (const { minutes, price } of durations) {
        await client.query("INSERT INTO game_durations (game_id, minutes, price) VALUES ($1, $2, $3)", [created.id, minutes, price]);
      }
      return created;
    });
    res.status(201).json(new ApiResponse(201, "Game created", { game: { ...game, durations } }));
  } catch (error) {
    if (error.code === "23505") throw new ApiError(409, "A game with this name already exists").setErrorCode(ERROR_CODES.VALIDATION_FAILED);
    throw error;
  }
});
