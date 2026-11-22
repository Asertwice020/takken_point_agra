import { BOOKING_STATUS, ERROR_CODES } from "../../../../constants.js";
import { ApiError } from "../../../../utils/basic/ApiError.js";
import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";
import { toSlotStartDate } from "../../../../utils/basic/time.util.js";
import { lockGameDate, withTransaction } from "../../../../utils/handlers/withTransaction.js";
import { expireStaleBookings } from "../../../booking/logic/expireStaleBookings.js";
import { loadSeatsLeft } from "../../../booking/logic/loadSeatsLeft.js";
import { notifyTicketConfirmed } from "../../../booking/logic/bookingNotifications.js";

// ==========================================
// * CONFIRM PAYMENT (also handles a LATE confirm after the hold expired)
// ==========================================
export const confirmBooking = asyncHandler(async (req, res) => {
  const confirmed = await withTransaction(async (client) => {
    const { rows: [found] } = await client.query("SELECT game_id, booking_date FROM bookings WHERE id = $1", [req.params.id]);
    if (!found) throw new ApiError(404, "Booking not found").setErrorCode(ERROR_CODES.BOOKING_NOT_FOUND);

    await lockGameDate(client, found.game_id, found.booking_date);
    await expireStaleBookings(client);
    const { rows: [booking] } = await client.query("SELECT * FROM bookings WHERE id = $1 FOR UPDATE", [req.params.id]);

    const isLateConfirm = booking.status === BOOKING_STATUS.EXPIRED && Boolean(booking.utr);
    if (booking.status !== BOOKING_STATUS.AWAITING_CONFIRMATION && !isLateConfirm) {
      throw new ApiError(409, "This booking cannot be confirmed").setErrorCode(ERROR_CODES.INVALID_BOOKING_STATE);
    }

    if (isLateConfirm) {
      const refundNote = `Refund ₹${booking.amount} to the customer.`;
      if (toSlotStartDate(booking.booking_date, booking.start_time).getTime() + booking.duration_minutes * 60000 <= Date.now()) {
        throw new ApiError(409, `Slot already ended. ${refundNote}`).setErrorCode(ERROR_CODES.SEAT_TAKEN);
      }
      const seatsLeft = await loadSeatsLeft(client, {
        gameId: booking.game_id, bookingDate: booking.booking_date, startTime: booking.start_time, durationMinutes: booking.duration_minutes,
      });
      if (seatsLeft < 1) throw new ApiError(409, `Seat no longer available. ${refundNote}`).setErrorCode(ERROR_CODES.SEAT_TAKEN);
    }

    const { rows: [updated] } = await client.query(
      "UPDATE bookings SET status = $1, confirmed_at = now(), hold_expires_at = NULL WHERE id = $2 RETURNING id, status, ticket_code",
      [BOOKING_STATUS.CONFIRMED, booking.id]);
    return updated;
  });
  notifyTicketConfirmed(confirmed.id);
  res.json(new ApiResponse(200, "Booking confirmed", { booking: confirmed }));
});





// import { BOOKING_STATUS, ERROR_CODES } from "../../../../constants.js";
// import { ApiError } from "../../../../utils/basic/ApiError.js";
// import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
// import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";
// import { toSlotStartDate } from "../../../../utils/basic/time.util.js";
// import { lockGameDate, withTransaction } from "../../../../utils/handlers/withTransaction.js";
// import { expireStaleBookings } from "../../../booking/logic/expireStaleBookings.js";
// import { loadSeatsLeft } from "../../../booking/logic/loadSeatsLeft.js";
// import { notifyTicketConfirmed } from "../../../booking/logic/bookingNotifications.js";

// // ==========================================
// // * CONFIRM PAYMENT (also handles a LATE confirm after the hold expired)
// // ==========================================
// export const confirmBooking = asyncHandler(async (req, res) => {
//   const confirmed = await withTransaction(async (client) => {
//     const { rows: [found] } = await client.query("SELECT game_id, booking_date FROM bookings WHERE id = $1", [req.params.id]);
//     if (!found) throw new ApiError(404, "Booking not found").setErrorCode(ERROR_CODES.BOOKING_NOT_FOUND);

//     await lockGameDate(client, found.game_id, found.booking_date);
//     await expireStaleBookings(client);
//     const { rows: [booking] } = await client.query("SELECT * FROM bookings WHERE id = $1 FOR UPDATE", [req.params.id]);

//     const isLateConfirm = booking.status === BOOKING_STATUS.EXPIRED && Boolean(booking.utr);
//     if (booking.status !== BOOKING_STATUS.AWAITING_CONFIRMATION && !isLateConfirm) {
//       throw new ApiError(409, "This booking cannot be confirmed").setErrorCode(ERROR_CODES.INVALID_BOOKING_STATE);
//     }

//     if (isLateConfirm) {
//       const refundNote = `Refund ₹${booking.amount} to the customer.`;
//       if (toSlotStartDate(booking.booking_date, booking.start_time) <= new Date()) {
//         throw new ApiError(409, `Slot already started. ${refundNote}`).setErrorCode(ERROR_CODES.SEAT_TAKEN);
//       }
//       const seatsLeft = await loadSeatsLeft(client, {
//         gameId: booking.game_id, bookingDate: booking.booking_date, startTime: booking.start_time, durationMinutes: booking.duration_minutes,
//       });
//       if (seatsLeft < 1) throw new ApiError(409, `Seat no longer available. ${refundNote}`).setErrorCode(ERROR_CODES.SEAT_TAKEN);
//     }

//     const { rows: [updated] } = await client.query(
//       "UPDATE bookings SET status = $1, confirmed_at = now(), hold_expires_at = NULL WHERE id = $2 RETURNING id, status, ticket_code",
//       [BOOKING_STATUS.CONFIRMED, booking.id]);
//     return updated;
//   });
//   notifyTicketConfirmed(confirmed.id);
//   res.json(new ApiResponse(200, "Booking confirmed", { booking: confirmed }));
// });
