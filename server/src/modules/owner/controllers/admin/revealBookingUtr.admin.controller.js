import { pool } from "../../../../config/db.js";
import { ERROR_CODES } from "../../../../constants.js";
import { ApiError } from "../../../../utils/basic/ApiError.js";
import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";

export const revealBookingUtr = asyncHandler(async (req, res) => {
  const { rows: [booking] } = await pool.query("SELECT utr FROM bookings WHERE id = $1", [req.params.id]);
  if (!booking) throw new ApiError(404, "Booking not found").setErrorCode(ERROR_CODES.BOOKING_NOT_FOUND);
  res.json(new ApiResponse(200, "UTR", { utr: booking.utr }));
});
