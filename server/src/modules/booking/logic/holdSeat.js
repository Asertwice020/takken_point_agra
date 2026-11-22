import crypto from "node:crypto";
import { BOOKING_STATUS, DEFAULT_PAYMENT_HOLD_MINUTES, ERROR_CODES, MAX_UNFINISHED_BOOKINGS_PER_USER } from "../../../constants.js";
import { ApiError } from "../../../utils/basic/ApiError.js";
import { lockGameDate, withTransaction } from "../../../utils/handlers/withTransaction.js";
import { computeSeatsLeft, validateSlotRequest } from "./slot.rules.js";

// * A booking counts against seats when confirmed, or while its hold is alive (NULL = paused, shop OFF)
export const ACTIVE_BOOKING_CONDITION = `(
  status IN ('${BOOKING_STATUS.CONFIRMED}', '${BOOKING_STATUS.USED}')
  OR (status IN ('${BOOKING_STATUS.PENDING_PAYMENT}', '${BOOKING_STATUS.AWAITING_CONFIRMATION}')
      AND (hold_expires_at IS NULL OR hold_expires_at > now()))
)`;

const UNCONFIRMED_STATUSES = `('${BOOKING_STATUS.PENDING_PAYMENT}', '${BOOKING_STATUS.AWAITING_CONFIRMATION}')`;

// ==========================================
// * HOLD A SEAT (all rules checked inside one locked transaction)
// ==========================================
export const holdSeat = ({ userId, gameId, bookingDate, startTime, durationMinutes }) =>
  withTransaction(async (client) => {
    await lockGameDate(client, gameId, bookingDate);

    const { rows: [settings] } = await client.query("SELECT * FROM settings WHERE id = 1");
    const { rows: [game] } = await client.query("SELECT * FROM games WHERE id = $1 AND is_active", [gameId]);
    if (!game) throw new ApiError(404, "Game not available").setErrorCode(ERROR_CODES.GAME_UNAVAILABLE);

    const { rows: durations } = await client.query("SELECT minutes, price FROM game_durations WHERE game_id = $1", [gameId]);
    validateSlotRequest({
      bookingDate, startTime, durationMinutes, settings,
      allowedDurations: durations.map((duration) => duration.minutes),
    });

    // * Customers can book as many slots as they want. Only unfinished ones (unpaid, or waiting for the owner) are capped.
    const { rows: [{ count: unfinishedCount }] } = await client.query(
      `SELECT count(*)::int AS count FROM bookings WHERE user_id = $1 AND status IN ${UNCONFIRMED_STATUSES}
       AND (hold_expires_at IS NULL OR hold_expires_at > now())`, [userId]);
    if (unfinishedCount >= MAX_UNFINISHED_BOOKINGS_PER_USER) {
      throw new ApiError(409, "You have too many unfinished bookings. Finish paying or wait for confirmation first.").setErrorCode(ERROR_CODES.ACTIVE_BOOKING_EXISTS);
    }

    // * The stations are shared by ALL games, so every game's bookings and blocks count
    const { rows: activeBookings } = await client.query(
      `SELECT start_time, duration_minutes FROM bookings WHERE booking_date = $1 AND ${ACTIVE_BOOKING_CONDITION}`, [bookingDate]);
    const { rows: blockedSeats } = await client.query("SELECT start_time, seats FROM blocked_seats WHERE booking_date = $1", [bookingDate]);

    const seatsLeft = computeSeatsLeft({ stations: settings.stations, startTime, durationMinutes, activeBookings, blockedSeats });
    if (seatsLeft < 1) throw new ApiError(409, "No seats left for this slot").setErrorCode(ERROR_CODES.SLOT_FULL);

    const amount = durations.find((duration) => duration.minutes === durationMinutes).price;
    const ticketCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    const { rows: [booking] } = await client.query(
      `INSERT INTO bookings (user_id, game_id, booking_date, start_time, duration_minutes, amount, status, ticket_code, hold_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now() + make_interval(mins => $9)) RETURNING *`,
      [userId, gameId, bookingDate, startTime, durationMinutes, amount, BOOKING_STATUS.PENDING_PAYMENT, ticketCode, DEFAULT_PAYMENT_HOLD_MINUTES]);
    return booking;
  });




// import crypto from "node:crypto";
// import { BOOKING_STATUS, DEFAULT_PAYMENT_HOLD_MINUTES, ERROR_CODES, MAX_UNFINISHED_BOOKINGS_PER_USER } from "../../../constants.js";
// import { ApiError } from "../../../utils/basic/ApiError.js";
// import { lockGameDate, withTransaction } from "../../../utils/handlers/withTransaction.js";
// import { computeSeatsLeft, validateSlotRequest } from "./slot.rules.js";

// // * A booking counts against seats when confirmed, or while its hold is alive (NULL = paused, shop OFF)
// export const ACTIVE_BOOKING_CONDITION = `(
//   status IN ('${BOOKING_STATUS.CONFIRMED}', '${BOOKING_STATUS.USED}')
//   OR (status IN ('${BOOKING_STATUS.PENDING_PAYMENT}', '${BOOKING_STATUS.AWAITING_CONFIRMATION}')
//       AND (hold_expires_at IS NULL OR hold_expires_at > now()))
// )`;

// const UNCONFIRMED_STATUSES = `('${BOOKING_STATUS.PENDING_PAYMENT}', '${BOOKING_STATUS.AWAITING_CONFIRMATION}')`;

// // ==========================================
// // * HOLD A SEAT (all rules checked inside one locked transaction)
// // ==========================================
// export const holdSeat = ({ userId, gameId, bookingDate, startTime, durationMinutes }) =>
//   withTransaction(async (client) => {
//     await lockGameDate(client, gameId, bookingDate);

//     const { rows: [settings] } = await client.query("SELECT * FROM settings WHERE id = 1");
//     const { rows: [game] } = await client.query("SELECT * FROM games WHERE id = $1 AND is_active", [gameId]);
//     if (!game) throw new ApiError(404, "Game not available").setErrorCode(ERROR_CODES.GAME_UNAVAILABLE);

//     const { rows: durations } = await client.query("SELECT minutes, price FROM game_durations WHERE game_id = $1", [gameId]);
//     validateSlotRequest({
//       bookingDate, startTime, durationMinutes, settings,
//       allowedDurations: durations.map((duration) => duration.minutes),
//     });

//     // * Customers can book as many slots as they want. Only unfinished ones (unpaid, or waiting for the owner) are capped.
//     const { rows: [{ count: unfinishedCount }] } = await client.query(
//       `SELECT count(*)::int AS count FROM bookings WHERE user_id = $1 AND status IN ${UNCONFIRMED_STATUSES}
//        AND (hold_expires_at IS NULL OR hold_expires_at > now())`, [userId]);
//     if (unfinishedCount >= MAX_UNFINISHED_BOOKINGS_PER_USER) {
//       throw new ApiError(409, "You have too many unfinished bookings. Finish paying or wait for confirmation first.").setErrorCode(ERROR_CODES.ACTIVE_BOOKING_EXISTS);
//     }

//     const { rows: activeBookings } = await client.query(
//       `SELECT start_time, duration_minutes FROM bookings WHERE game_id = $1 AND booking_date = $2 AND ${ACTIVE_BOOKING_CONDITION}`,
//       [gameId, bookingDate]);
//     const { rows: blockedSeats } = await client.query(
//       "SELECT start_time, seats FROM blocked_seats WHERE game_id = $1 AND booking_date = $2", [gameId, bookingDate]);

//     const seatsLeft = computeSeatsLeft({ stations: game.stations, startTime, durationMinutes, activeBookings, blockedSeats });
//     if (seatsLeft < 1) throw new ApiError(409, "No seats left for this slot").setErrorCode(ERROR_CODES.SLOT_FULL);

//     const amount = durations.find((duration) => duration.minutes === durationMinutes).price;
//     const ticketCode = crypto.randomBytes(4).toString("hex").toUpperCase();
//     const { rows: [booking] } = await client.query(
//       `INSERT INTO bookings (user_id, game_id, booking_date, start_time, duration_minutes, amount, status, ticket_code, hold_expires_at)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now() + make_interval(mins => $9)) RETURNING *`,
//       [userId, gameId, bookingDate, startTime, durationMinutes, amount, BOOKING_STATUS.PENDING_PAYMENT, ticketCode, DEFAULT_PAYMENT_HOLD_MINUTES]);
//     return booking;
//   });



// import crypto from "node:crypto";
// import { BOOKING_STATUS, DEFAULT_PAYMENT_HOLD_MINUTES, ERROR_CODES } from "../../../constants.js";
// import { ApiError } from "../../../utils/basic/ApiError.js";
// import { lockGameDate, withTransaction } from "../../../utils/handlers/withTransaction.js";
// import { computeSeatsLeft, validateSlotRequest } from "./slot.rules.js";

// // * A booking counts against seats when confirmed, or while its hold is alive (NULL = paused, shop OFF)
// export const ACTIVE_BOOKING_CONDITION = `(
//   status IN ('${BOOKING_STATUS.CONFIRMED}', '${BOOKING_STATUS.USED}')
//   OR (status IN ('${BOOKING_STATUS.PENDING_PAYMENT}', '${BOOKING_STATUS.AWAITING_CONFIRMATION}')
//       AND (hold_expires_at IS NULL OR hold_expires_at > now()))
// )`;

// const UNCONFIRMED_STATUSES = `('${BOOKING_STATUS.PENDING_PAYMENT}', '${BOOKING_STATUS.AWAITING_CONFIRMATION}')`;

// // ==========================================
// // * HOLD A SEAT (all rules checked inside one locked transaction)
// // ==========================================
// export const holdSeat = ({ userId, gameId, bookingDate, startTime, durationMinutes }) =>
//   withTransaction(async (client) => {
//     await lockGameDate(client, gameId, bookingDate);

//     const { rows: [settings] } = await client.query("SELECT * FROM settings WHERE id = 1");
//     const { rows: [game] } = await client.query("SELECT * FROM games WHERE id = $1 AND is_active", [gameId]);
//     if (!game) throw new ApiError(404, "Game not available").setErrorCode(ERROR_CODES.GAME_UNAVAILABLE);

//     const { rows: durations } = await client.query("SELECT minutes, price FROM game_durations WHERE game_id = $1", [gameId]);
//     validateSlotRequest({
//       bookingDate, startTime, durationMinutes, settings,
//       allowedDurations: durations.map((duration) => duration.minutes),
//     });

//     const { rowCount: unconfirmedCount } = await client.query(
//       `SELECT 1 FROM bookings WHERE user_id = $1 AND status IN ${UNCONFIRMED_STATUSES}
//        AND (hold_expires_at IS NULL OR hold_expires_at > now()) LIMIT 1`, [userId]);
//     if (unconfirmedCount) throw new ApiError(409, "Finish your current booking first").setErrorCode(ERROR_CODES.ACTIVE_BOOKING_EXISTS);

//     const { rows: activeBookings } = await client.query(
//       `SELECT start_time, duration_minutes FROM bookings WHERE game_id = $1 AND booking_date = $2 AND ${ACTIVE_BOOKING_CONDITION}`,
//       [gameId, bookingDate]);
//     const { rows: blockedSeats } = await client.query(
//       "SELECT start_time, seats FROM blocked_seats WHERE game_id = $1 AND booking_date = $2", [gameId, bookingDate]);

//     const seatsLeft = computeSeatsLeft({ stations: game.stations, startTime, durationMinutes, activeBookings, blockedSeats });
//     if (seatsLeft < 1) throw new ApiError(409, "No seats left for this slot").setErrorCode(ERROR_CODES.SLOT_FULL);

//     const amount = durations.find((duration) => duration.minutes === durationMinutes).price;
//     const ticketCode = crypto.randomBytes(4).toString("hex").toUpperCase();
//     const { rows: [booking] } = await client.query(
//       `INSERT INTO bookings (user_id, game_id, booking_date, start_time, duration_minutes, amount, status, ticket_code, hold_expires_at)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now() + make_interval(mins => $9)) RETURNING *`,
//       [userId, gameId, bookingDate, startTime, durationMinutes, amount, BOOKING_STATUS.PENDING_PAYMENT, ticketCode, DEFAULT_PAYMENT_HOLD_MINUTES]);
//     return booking;
//   });
