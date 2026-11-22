import { ERROR_CODES } from "../../../constants.js";
import { ApiError } from "../../../utils/basic/ApiError.js";
import { ApiResponse } from "../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../utils/basic/asyncHandler.js";
import { lockGameDate, withTransaction } from "../../../utils/handlers/withTransaction.js";
import { notifyRescheduled } from "../logic/bookingNotifications.js";
import { loadSeatsLeft } from "../logic/loadSeatsLeft.js";
import { assertReschedulable } from "../logic/reschedule.rules.js";

// ==========================================
// * RESCHEDULE: old seat released and new seat taken in ONE transaction
// ==========================================
export const rescheduleBooking = asyncHandler(async (req, res) => {
  const { bookingDate: newDate, startTime: newStartTime } = req.body;

  const { updated, previous } = await withTransaction(async (client) => {
    const { rows: [found] } = await client.query("SELECT game_id, booking_date FROM bookings WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
    if (!found) throw new ApiError(404, "Booking not found").setErrorCode(ERROR_CODES.BOOKING_NOT_FOUND);

    // * Lock both dates in a fixed order so two reschedules can never deadlock
    for (const date of [...new Set([found.booking_date, newDate])].sort()) await lockGameDate(client, found.game_id, date);

    const { rows: [booking] } = await client.query("SELECT * FROM bookings WHERE id = $1 FOR UPDATE", [req.params.id]);
    const { rows: [settings] } = await client.query("SELECT * FROM settings WHERE id = 1");
    assertReschedulable({ booking, newDate, newStartTime, settings });

    const seatsLeft = await loadSeatsLeft(client, {
      gameId: booking.game_id, bookingDate: newDate, startTime: newStartTime,
      durationMinutes: booking.duration_minutes, excludeBookingId: booking.id,
    });
    if (seatsLeft < 1) throw new ApiError(409, "No seats left for that slot").setErrorCode(ERROR_CODES.SLOT_FULL);

    const { rows: [result] } = await client.query(
      `UPDATE bookings SET booking_date = $1, start_time = $2, reschedule_count = reschedule_count + 1
       WHERE id = $3 RETURNING id, status, booking_date, start_time, duration_minutes, reschedule_count`,
      [newDate, newStartTime, booking.id]);
    await client.query(
      "INSERT INTO reschedules (booking_id, from_date, from_time, to_date, to_time) VALUES ($1, $2, $3, $4, $5)",
      [booking.id, booking.booking_date, booking.start_time, newDate, newStartTime]);
    return { updated: result, previous: { booking_date: booking.booking_date, start_time: booking.start_time, duration_minutes: booking.duration_minutes } };
  });

  notifyRescheduled(updated.id, previous);
  res.json(new ApiResponse(200, "Booking rescheduled", {
    booking: {
      id: updated.id, status: updated.status, bookingDate: updated.booking_date, startTime: updated.start_time,
      durationMinutes: updated.duration_minutes, rescheduleCount: updated.reschedule_count,
    },
  }));
});
