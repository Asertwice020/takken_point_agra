import { BLOCK_MINUTES, ERROR_CODES } from "../../../../constants.js";
import { ApiError } from "../../../../utils/basic/ApiError.js";
import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";
import { timeToMinutes } from "../../../../utils/basic/time.util.js";
import { lockGameDate, withTransaction } from "../../../../utils/handlers/withTransaction.js";
import { loadSeatsLeft } from "../../../booking/logic/loadSeatsLeft.js";
import { getBlockStarts } from "../../../booking/logic/slot.rules.js";

// ==========================================
// * BLOCK SEATS (walk-ins, maintenance): venue-wide, one row per 30-minute block. gameId is optional (a note only).
// ==========================================
export const blockSeats = asyncHandler(async (req, res) => {
  const { bookingDate, startTime, durationMinutes, seats } = req.body;
  const gameId = req.body.gameId ?? null;

  const blocked = await withTransaction(async (client) => {
    await lockGameDate(client, gameId, bookingDate);
    if (gameId !== null) {
      const { rowCount } = await client.query("SELECT 1 FROM games WHERE id = $1", [gameId]);
      if (!rowCount) throw new ApiError(404, "Game not found").setErrorCode(ERROR_CODES.GAME_UNAVAILABLE);
    }
    const { rows: [settings] } = await client.query("SELECT open_time, close_time, stations FROM settings WHERE id = 1");

    const start = timeToMinutes(startTime);
    if (start % BLOCK_MINUTES !== 0) throw new ApiError(400, "Start time must be on a 30-minute step").setErrorCode(ERROR_CODES.INVALID_SLOT);
    if (start < timeToMinutes(settings.open_time) || start + durationMinutes > timeToMinutes(settings.close_time)) {
      throw new ApiError(400, "Outside opening hours").setErrorCode(ERROR_CODES.OUTSIDE_OPENING_HOURS);
    }
    if (seats > settings.stations) throw new ApiError(400, `You only have ${settings.stations} stations`).setErrorCode(ERROR_CODES.INVALID_SLOT);

    // * Never block seats that are already taken by customers
    const seatsLeft = await loadSeatsLeft(client, { bookingDate, startTime, durationMinutes });
    if (seatsLeft < seats) throw new ApiError(409, "Not enough free seats to block").setErrorCode(ERROR_CODES.SLOT_FULL);

    const rows = [];
    for (const blockStart of getBlockStarts(startTime, durationMinutes)) {
      const { rows: [row] } = await client.query(
        "INSERT INTO blocked_seats (game_id, booking_date, start_time, seats) VALUES ($1, $2, $3, $4) RETURNING id, start_time, seats",
        [gameId, bookingDate, blockStart, seats]);
      rows.push(row);
    }
    return rows;
  });
  res.status(201).json(new ApiResponse(201, "Seats blocked", { blocked }));
});




// import { BLOCK_MINUTES, ERROR_CODES } from "../../../../constants.js";
// import { ApiError } from "../../../../utils/basic/ApiError.js";
// import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
// import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";
// import { timeToMinutes } from "../../../../utils/basic/time.util.js";
// import { lockGameDate, withTransaction } from "../../../../utils/handlers/withTransaction.js";
// import { loadSeatsLeft } from "../../../booking/logic/loadSeatsLeft.js";
// import { getBlockStarts } from "../../../booking/logic/slot.rules.js";

// // ==========================================
// // * BLOCK SEATS (walk-ins, maintenance): one row per 30-minute block
// // ==========================================
// export const blockSeats = asyncHandler(async (req, res) => {
//   const { gameId, bookingDate, startTime, durationMinutes, seats } = req.body;

//   const blocked = await withTransaction(async (client) => {
//     await lockGameDate(client, gameId, bookingDate);
//     const { rows: [game] } = await client.query("SELECT stations FROM games WHERE id = $1", [gameId]);
//     if (!game) throw new ApiError(404, "Game not found").setErrorCode(ERROR_CODES.GAME_UNAVAILABLE);
//     const { rows: [settings] } = await client.query("SELECT open_time, close_time FROM settings WHERE id = 1");

//     const start = timeToMinutes(startTime);
//     if (start % BLOCK_MINUTES !== 0) throw new ApiError(400, "Start time must be on a 30-minute step").setErrorCode(ERROR_CODES.INVALID_SLOT);
//     if (start < timeToMinutes(settings.open_time) || start + durationMinutes > timeToMinutes(settings.close_time)) {
//       throw new ApiError(400, "Outside opening hours").setErrorCode(ERROR_CODES.OUTSIDE_OPENING_HOURS);
//     }
//     if (seats > game.stations) throw new ApiError(400, `This game only has ${game.stations} stations`).setErrorCode(ERROR_CODES.INVALID_SLOT);

//     // * Never block seats that are already taken by customers
//     const seatsLeft = await loadSeatsLeft(client, { gameId, bookingDate, startTime, durationMinutes });
//     if (seatsLeft < seats) throw new ApiError(409, "Not enough free seats to block").setErrorCode(ERROR_CODES.SLOT_FULL);

//     const rows = [];
//     for (const blockStart of getBlockStarts(startTime, durationMinutes)) {
//       const { rows: [row] } = await client.query(
//         "INSERT INTO blocked_seats (game_id, booking_date, start_time, seats) VALUES ($1, $2, $3, $4) RETURNING id, start_time, seats",
//         [gameId, bookingDate, blockStart, seats]);
//       rows.push(row);
//     }
//     return rows;
//   });
//   res.status(201).json(new ApiResponse(201, "Seats blocked", { blocked }));
// });
