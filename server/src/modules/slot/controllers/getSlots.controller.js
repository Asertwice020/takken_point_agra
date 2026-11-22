import { pool } from "../../../config/db.js";
import { ERROR_CODES } from "../../../constants.js";
import { ApiError } from "../../../utils/basic/ApiError.js";
import { ApiResponse } from "../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../utils/basic/asyncHandler.js";
import { ACTIVE_BOOKING_CONDITION } from "../../booking/logic/holdSeat.js";
import { buildSlotGrid } from "../logic/buildSlotGrid.js";

export const getSlots = asyncHandler(async (req, res) => {
  const { gameId, date, duration } = req.query;

  const { rows: [settings] } = await pool.query("SELECT * FROM settings WHERE id = 1");
  const { rows: [game] } = await pool.query("SELECT * FROM games WHERE id = $1 AND is_active", [gameId]);
  if (!game) throw new ApiError(404, "Game not available").setErrorCode(ERROR_CODES.GAME_UNAVAILABLE);

  const { rows: durations } = await pool.query("SELECT minutes FROM game_durations WHERE game_id = $1", [gameId]);
  // * The stations are shared by ALL games, so every game's bookings and blocks count
  const { rows: activeBookings } = await pool.query(
    `SELECT start_time, duration_minutes FROM bookings WHERE booking_date = $1 AND ${ACTIVE_BOOKING_CONDITION}`, [date]);
  const { rows: blockedSeats } = await pool.query("SELECT start_time, seats FROM blocked_seats WHERE booking_date = $1", [date]);

  const slots = buildSlotGrid({
    bookingDate: date, durationMinutes: duration, stations: settings.stations, settings, activeBookings, blockedSeats,
    allowedDurations: durations.map((row) => row.minutes),
  });
  res.json(new ApiResponse(200, "Slots", { shopOpen: settings.shop_open, slots }));
});





// import { pool } from "../../../config/db.js";
// import { ERROR_CODES } from "../../../constants.js";
// import { ApiError } from "../../../utils/basic/ApiError.js";
// import { ApiResponse } from "../../../utils/basic/ApiResponse.js";
// import { asyncHandler } from "../../../utils/basic/asyncHandler.js";
// import { ACTIVE_BOOKING_CONDITION } from "../../booking/logic/holdSeat.js";
// import { buildSlotGrid } from "../logic/buildSlotGrid.js";

// export const getSlots = asyncHandler(async (req, res) => {
//   const { gameId, date, duration } = req.query;

//   const { rows: [settings] } = await pool.query("SELECT * FROM settings WHERE id = 1");
//   const { rows: [game] } = await pool.query("SELECT * FROM games WHERE id = $1 AND is_active", [gameId]);
//   if (!game) throw new ApiError(404, "Game not available").setErrorCode(ERROR_CODES.GAME_UNAVAILABLE);

//   const { rows: durations } = await pool.query("SELECT minutes FROM game_durations WHERE game_id = $1", [gameId]);
//   const { rows: activeBookings } = await pool.query(
//     `SELECT start_time, duration_minutes FROM bookings WHERE game_id = $1 AND booking_date = $2 AND ${ACTIVE_BOOKING_CONDITION}`,
//     [gameId, date]);
//   const { rows: blockedSeats } = await pool.query(
//     "SELECT start_time, seats FROM blocked_seats WHERE game_id = $1 AND booking_date = $2", [gameId, date]);

//   const slots = buildSlotGrid({
//     bookingDate: date, durationMinutes: duration, stations: game.stations, settings, activeBookings, blockedSeats,
//     allowedDurations: durations.map((row) => row.minutes),
//   });
//   res.json(new ApiResponse(200, "Slots", { shopOpen: settings.shop_open, slots }));
// });
