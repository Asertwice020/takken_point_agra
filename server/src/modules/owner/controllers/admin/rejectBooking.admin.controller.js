import { pool } from "../../../../config/db.js";
import { BOOKING_STATUS, ERROR_CODES } from "../../../../constants.js";
import { ApiError } from "../../../../utils/basic/ApiError.js";
import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";

export const rejectBooking = asyncHandler(async (req, res) => {
  const { rows: [booking] } = await pool.query(
    "UPDATE bookings SET status = $1, hold_expires_at = NULL WHERE id = $2 AND status = $3 RETURNING id, status",
    [BOOKING_STATUS.REJECTED, req.params.id, BOOKING_STATUS.AWAITING_CONFIRMATION]);
  if (!booking) throw new ApiError(409, "Booking not found or not waiting for confirmation").setErrorCode(ERROR_CODES.INVALID_BOOKING_STATE);
  res.json(new ApiResponse(200, "Booking rejected", { booking }));
});
