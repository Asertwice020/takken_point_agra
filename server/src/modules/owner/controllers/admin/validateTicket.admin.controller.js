import { BOOKING_STATUS } from "../../../../constants.js";
import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";
import { withTransaction } from "../../../../utils/handlers/withTransaction.js";
import { evaluateTicket } from "../../../booking/logic/evaluateTicket.js";

// ==========================================
// * SCAN A TICKET: valid tickets are marked USED in the same locked step
// ==========================================
export const validateTicket = asyncHandler(async (req, res) => {
  const code = req.body.code.trim().toUpperCase();
  const { evaluation, booking } = await withTransaction(async (client) => {
    const { rows: [found] } = await client.query(
      `SELECT b.*, g.name AS game_name, p.name AS customer_name
       FROM bookings b JOIN games g ON g.id = b.game_id JOIN profiles p ON p.id = b.user_id
       WHERE b.ticket_code = $1 FOR UPDATE OF b`, [code]);
    const result = evaluateTicket({ booking: found });
    if (result.isValid) await client.query("UPDATE bookings SET status = $1, used_at = now() WHERE id = $2", [BOOKING_STATUS.USED, found.id]);
    return { evaluation: result, booking: found };
  });

  res.json(new ApiResponse(200, evaluation.isValid ? "Ticket valid" : "Ticket not valid", {
    isValid: evaluation.isValid,
    reason: evaluation.reason,
    booking: booking && {
      customerName: booking.customer_name, gameName: booking.game_name, bookingDate: booking.booking_date,
      startTime: booking.start_time, durationMinutes: booking.duration_minutes, usedAt: booking.used_at,
    },
  }));
});
