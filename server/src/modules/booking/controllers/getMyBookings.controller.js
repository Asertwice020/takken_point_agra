import { pool } from "../../../config/db.js";
import { BOOKING_STATUS } from "../../../constants.js";
import { ApiResponse } from "../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../utils/basic/asyncHandler.js";
import { expireStaleBookings } from "../logic/expireStaleBookings.js";
import { getRescheduleBlockMessage } from "../logic/reschedule.rules.js";

// * "My Tickets": ticket code (for the QR) only for confirmed or used bookings
export const getMyBookings = asyncHandler(async (req, res) => {
  await expireStaleBookings();
  const { rows: [settings] } = await pool.query("SELECT * FROM settings WHERE id = 1");
  const { rows } = await pool.query(
    `SELECT b.id, b.status, b.booking_date, b.start_time, b.duration_minutes, b.amount, b.ticket_code, b.reschedule_count, g.name AS game_name
     FROM bookings b JOIN games g ON g.id = b.game_id WHERE b.user_id = $1
     ORDER BY b.booking_date DESC, b.start_time DESC LIMIT 50`, [req.user.id]);

  const bookings = rows.map(({ ticket_code: ticketCode, ...booking }) => ({
    ...booking,
    ticketCode: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.USED].includes(booking.status) ? ticketCode : null,
    canReschedule: getRescheduleBlockMessage({ booking, settings }) === null,
  }));
  res.json(new ApiResponse(200, "My bookings", { bookings }));
});
