import { pool } from "../../../config/db.js";
import { env } from "../../../config/env.js";
import { BOOKING_STATUS, ERROR_CODES } from "../../../constants.js";
import { ApiError } from "../../../utils/basic/ApiError.js";
import { ApiResponse } from "../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../utils/basic/asyncHandler.js";
import { buildUpiLink } from "../logic/buildUpiLink.js";
import { expireStaleBookings } from "../logic/expireStaleBookings.js";

// * The client polls this every ~4 seconds until the status is final
export const getBookingStatus = asyncHandler(async (req, res) => {
  await expireStaleBookings();
  const { rows: [booking] } = await pool.query(
    `SELECT b.id, b.status, b.booking_date, b.start_time, b.duration_minutes, b.amount, b.ticket_code, b.hold_expires_at,
            g.name AS game_name, s.shop_open
     FROM bookings b JOIN games g ON g.id = b.game_id CROSS JOIN settings s
     WHERE b.id = $1 AND b.user_id = $2`, [req.params.id, req.user.id]);
  if (!booking) throw new ApiError(404, "Booking not found").setErrorCode(ERROR_CODES.BOOKING_NOT_FOUND);

  const isPaying = booking.status === BOOKING_STATUS.PENDING_PAYMENT;
  const hasTicket = [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.USED].includes(booking.status);
  res.json(new ApiResponse(200, "Booking status", {
    id: booking.id, status: booking.status, gameName: booking.game_name, bookingDate: booking.booking_date,
    startTime: booking.start_time, durationMinutes: booking.duration_minutes, amount: booking.amount,
    holdExpiresAt: booking.hold_expires_at, shopOpen: booking.shop_open,
    upiLink: isPaying ? buildUpiLink({ upiId: env.upiId, payeeName: env.upiPayeeName, amount: booking.amount, ticketCode: booking.ticket_code }) : null,
    ticketCode: hasTicket ? booking.ticket_code : null,
  }));
});
