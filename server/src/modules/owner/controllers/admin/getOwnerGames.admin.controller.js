import { pool } from "../../../../config/db.js";
import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";

// * Owner view: includes hidden (inactive) games
export const getOwnerGames = asyncHandler(async (req, res) => {
  const { rows: games } = await pool.query(
    `SELECT g.id, g.name, g.stations, g.is_active,
            COALESCE(json_agg(json_build_object('minutes', d.minutes, 'price', d.price) ORDER BY d.minutes)
                     FILTER (WHERE d.minutes IS NOT NULL), '[]') AS durations
     FROM games g LEFT JOIN game_durations d ON d.game_id = g.id GROUP BY g.id ORDER BY g.id`);
  res.json(new ApiResponse(200, "Games", { games }));
});
