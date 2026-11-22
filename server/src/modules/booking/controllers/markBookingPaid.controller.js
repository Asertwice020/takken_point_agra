import { BOOKING_STATUS, DEFAULT_OWNER_CONFIRM_WINDOW_MINUTES, ERROR_CODES } from "../../../constants.js";
import { ApiError } from "../../../utils/basic/ApiError.js";
import { ApiResponse } from "../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../utils/basic/asyncHandler.js";
import { withTransaction } from "../../../utils/handlers/withTransaction.js";
import { notifyOwnerOfPayment } from "../logic/bookingNotifications.js";

// * Customer taps "I've paid" and sends the full UTR. Owner timer: 30 min while shop is ON, paused (NULL) while OFF.
export const markBookingPaid = asyncHandler(async (req, res) => {
  try {
    const updated = await withTransaction(async (client) => {
      const { rows: [booking] } = await client.query(
        "SELECT * FROM bookings WHERE id = $1 AND user_id = $2 FOR UPDATE", [req.params.id, req.user.id]);
      if (!booking) throw new ApiError(404, "Booking not found").setErrorCode(ERROR_CODES.BOOKING_NOT_FOUND);
      if (booking.status !== BOOKING_STATUS.PENDING_PAYMENT) {
        throw new ApiError(409, "This booking is not waiting for payment").setErrorCode(ERROR_CODES.INVALID_BOOKING_STATE);
      }
      if (booking.hold_expires_at <= new Date()) throw new ApiError(409, "Your seat hold has expired").setErrorCode(ERROR_CODES.HOLD_EXPIRED);

      const { rows: [{ shop_open: isShopOpen }] } = await client.query("SELECT shop_open FROM settings WHERE id = 1");
      const { rows: [result] } = await client.query(
        `UPDATE bookings SET status = $1, utr = $2,
           hold_expires_at = CASE WHEN $3::boolean THEN now() + make_interval(mins => $4) ELSE NULL END,
           reminder_count = 0, last_reminder_at = CASE WHEN $3::boolean THEN now() ELSE NULL END
         WHERE id = $5 RETURNING status, hold_expires_at`,
        [BOOKING_STATUS.AWAITING_CONFIRMATION, req.body.utr, isShopOpen, DEFAULT_OWNER_CONFIRM_WINDOW_MINUTES, booking.id]);
      return { ...result, bookingId: booking.id, isShopOpen };
    });
    if (updated.isShopOpen) notifyOwnerOfPayment(updated.bookingId); // no alert emails while the shop is OFF
    res.json(new ApiResponse(200, "Waiting for owner confirmation", { status: updated.status, holdExpiresAt: updated.hold_expires_at }));
  } catch (error) {
    if (error.code === "23505") throw new ApiError(409, "This UTR has already been used").setErrorCode(ERROR_CODES.DUPLICATE_UTR);
    throw error;
  }
});




// import { BOOKING_STATUS, DEFAULT_OWNER_CONFIRM_WINDOW_MINUTES, ERROR_CODES } from "../../../constants.js";
// import { ApiError } from "../../../utils/basic/ApiError.js";
// import { ApiResponse } from "../../../utils/basic/ApiResponse.js";
// import { asyncHandler } from "../../../utils/basic/asyncHandler.js";
// import { withTransaction } from "../../../utils/handlers/withTransaction.js";
// import { SLOT_START_SQL } from "../logic/bookingSql.js";
// import { notifyOwnerOfPayment } from "../logic/bookingNotifications.js";

// // * Customer taps "I've paid" and sends the full UTR. Owner timer: 30 min while shop is ON, paused (NULL) while OFF.
// export const markBookingPaid = asyncHandler(async (req, res) => {
//   try {
//     const updated = await withTransaction(async (client) => {
//       const { rows: [booking] } = await client.query(
//         "SELECT * FROM bookings WHERE id = $1 AND user_id = $2 FOR UPDATE", [req.params.id, req.user.id]);
//       if (!booking) throw new ApiError(404, "Booking not found").setErrorCode(ERROR_CODES.BOOKING_NOT_FOUND);
//       if (booking.status !== BOOKING_STATUS.PENDING_PAYMENT) {
//         throw new ApiError(409, "This booking is not waiting for payment").setErrorCode(ERROR_CODES.INVALID_BOOKING_STATE);
//       }
//       if (booking.hold_expires_at <= new Date()) throw new ApiError(409, "Your seat hold has expired").setErrorCode(ERROR_CODES.HOLD_EXPIRED);

//       const { rows: [{ shop_open: isShopOpen }] } = await client.query("SELECT shop_open FROM settings WHERE id = 1");
//       const { rows: [result] } = await client.query(
//         `UPDATE bookings SET status = $1, utr = $2,
//            hold_expires_at = CASE WHEN $3::boolean THEN LEAST(now() + make_interval(mins => $4), ${SLOT_START_SQL}) ELSE NULL END,
//            reminder_count = 0, last_reminder_at = CASE WHEN $3::boolean THEN now() ELSE NULL END
//          WHERE id = $5 RETURNING status, hold_expires_at`,
//         [BOOKING_STATUS.AWAITING_CONFIRMATION, req.body.utr, isShopOpen, DEFAULT_OWNER_CONFIRM_WINDOW_MINUTES, booking.id]);
//       return { ...result, bookingId: booking.id, isShopOpen };
//     });
//     if (updated.isShopOpen) notifyOwnerOfPayment(updated.bookingId); // no alert emails while the shop is OFF
//     res.json(new ApiResponse(200, "Waiting for owner confirmation", { status: updated.status, holdExpiresAt: updated.hold_expires_at }));
//   } catch (error) {
//     if (error.code === "23505") throw new ApiError(409, "This UTR has already been used").setErrorCode(ERROR_CODES.DUPLICATE_UTR);
//     throw error;
//   }
// });
