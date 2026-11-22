import { pool } from "../../../config/db.js";
import { ERROR_CODES } from "../../../constants.js";
import { ApiError } from "../../../utils/basic/ApiError.js";
import { ApiResponse } from "../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../utils/basic/asyncHandler.js";
import { holdSeat } from "../logic/holdSeat.js";

export const createBooking = asyncHandler(async (req, res) => {
  const { rowCount: hasProfile } = await pool.query("SELECT 1 FROM profiles WHERE id = $1", [req.user.id]);
  if (!hasProfile) throw new ApiError(400, "Add your name and phone first").setErrorCode(ERROR_CODES.PROFILE_REQUIRED);

  const booking = await holdSeat({ userId: req.user.id, ...req.body });
  res.status(201).json(new ApiResponse(201, "Seat held", {
    booking: {
      id: booking.id, status: booking.status, gameId: booking.game_id, bookingDate: booking.booking_date,
      startTime: booking.start_time, durationMinutes: booking.duration_minutes, amount: booking.amount,
      holdExpiresAt: booking.hold_expires_at,
    },
  }));
});
