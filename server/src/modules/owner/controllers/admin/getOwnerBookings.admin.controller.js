import { pool } from "../../../../config/db.js";
import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";
import { getTodayIst } from "../../../../utils/basic/time.util.js";
import { maskUtr } from "../../../../utils/basic/mask.util.js";
import { expireStaleBookings } from "../../../booking/logic/expireStaleBookings.js";

// * Defaults to today's bookings. UTR is always masked here; use the reveal route for the full number.
export const getOwnerBookings = asyncHandler(async (req, res) => {
  await expireStaleBookings();
  const { date, status } = req.query;
  const conditions = [];
  const values = [];
  if (date) { values.push(date); conditions.push(`b.booking_date = $${values.length}`); }
  if (status) { values.push(status); conditions.push(`b.status = $${values.length}`); }
  if (!date && !status) { values.push(getTodayIst()); conditions.push(`b.booking_date = $${values.length}`); }

  const { rows } = await pool.query(
    `SELECT b.id, b.booking_date, b.start_time, b.duration_minutes, b.amount, b.status, b.ticket_code, b.utr,
            b.hold_expires_at, b.created_at, g.name AS game_name, p.name AS customer_name, p.phone AS customer_phone, p.email AS customer_email
     FROM bookings b JOIN games g ON g.id = b.game_id JOIN profiles p ON p.id = b.user_id
     WHERE ${conditions.join(" AND ")} ORDER BY b.booking_date, b.start_time, b.id`, values);

  const bookings = rows.map(({ utr, ...booking }) => ({ ...booking, utrMasked: maskUtr(utr), hasUtr: Boolean(utr) }));
  res.json(new ApiResponse(200, "Bookings", { bookings }));
});
