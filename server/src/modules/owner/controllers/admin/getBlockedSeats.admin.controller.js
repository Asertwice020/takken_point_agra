import { pool } from "../../../../config/db.js";
import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";
import { getTodayIst } from "../../../../utils/basic/time.util.js";

export const getBlockedSeats = asyncHandler(async (req, res) => {
  const { rows: blocked } = await pool.query(
    `SELECT b.id, b.game_id, g.name AS game_name, b.booking_date, b.start_time, b.seats
     FROM blocked_seats b LEFT JOIN games g ON g.id = b.game_id WHERE b.booking_date = $1 ORDER BY b.start_time, b.id`,
    [req.query.date || getTodayIst()]);
  res.json(new ApiResponse(200, "Blocked seats", { blocked }));
});




// import { pool } from "../../../../config/db.js";
// import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
// import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";
// import { getTodayIst } from "../../../../utils/basic/time.util.js";

// export const getBlockedSeats = asyncHandler(async (req, res) => {
//   const { rows: blocked } = await pool.query(
//     `SELECT b.id, b.game_id, g.name AS game_name, b.booking_date, b.start_time, b.seats
//      FROM blocked_seats b JOIN games g ON g.id = b.game_id WHERE b.booking_date = $1 ORDER BY b.start_time, b.id`,
//     [req.query.date || getTodayIst()]);
//   res.json(new ApiResponse(200, "Blocked seats", { blocked }));
// });
