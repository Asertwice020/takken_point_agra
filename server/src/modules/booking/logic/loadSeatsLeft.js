import { ACTIVE_BOOKING_CONDITION } from "./holdSeat.js";
import { computeSeatsLeft } from "./slot.rules.js";

// * Stations are shared by ALL games, so every game's bookings and blocks count.
// * excludeBookingId: ignore this booking's own seat (used when rescheduling)
export const loadSeatsLeft = async (client, { bookingDate, startTime, durationMinutes, excludeBookingId = null }) => {
  const { rows: [settings] } = await client.query("SELECT stations FROM settings WHERE id = 1");
  const { rows: activeBookings } = await client.query(
    `SELECT start_time, duration_minutes FROM bookings
     WHERE booking_date = $1 AND ($2::bigint IS NULL OR id <> $2) AND ${ACTIVE_BOOKING_CONDITION}`,
    [bookingDate, excludeBookingId]);
  const { rows: blockedSeats } = await client.query("SELECT start_time, seats FROM blocked_seats WHERE booking_date = $1", [bookingDate]);
  return computeSeatsLeft({ stations: settings.stations, startTime, durationMinutes, activeBookings, blockedSeats });
};



// import { ACTIVE_BOOKING_CONDITION } from "./holdSeat.js";
// import { computeSeatsLeft } from "./slot.rules.js";

// // * excludeBookingId: ignore this booking's own seat (used when rescheduling)
// export const loadSeatsLeft = async (client, { gameId, bookingDate, startTime, durationMinutes, excludeBookingId = null }) => {
//   const { rows: [game] } = await client.query("SELECT stations FROM games WHERE id = $1", [gameId]);
//   const { rows: activeBookings } = await client.query(
//     `SELECT start_time, duration_minutes FROM bookings
//      WHERE game_id = $1 AND booking_date = $2 AND ($3::bigint IS NULL OR id <> $3) AND ${ACTIVE_BOOKING_CONDITION}`,
//     [gameId, bookingDate, excludeBookingId]);
//   const { rows: blockedSeats } = await client.query(
//     "SELECT start_time, seats FROM blocked_seats WHERE game_id = $1 AND booking_date = $2", [gameId, bookingDate]);
//   return computeSeatsLeft({ stations: game.stations, startTime, durationMinutes, activeBookings, blockedSeats });
// };
