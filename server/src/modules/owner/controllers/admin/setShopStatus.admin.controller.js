import { BOOKING_STATUS, DEFAULT_OWNER_CONFIRM_WINDOW_MINUTES } from "../../../../constants.js";
import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";
import { withTransaction } from "../../../../utils/handlers/withTransaction.js";
import { SLOT_END_SQL } from "../../../booking/logic/bookingSql.js";
import { expireStaleBookings } from "../../../booking/logic/expireStaleBookings.js";
import { sendWaitingSummary } from "../../../../services/mail.service.js";

// ==========================================
// * SHOP ON/OFF: ON restarts the owner timers of waiting bookings, OFF pauses them
// ==========================================
export const setShopStatus = asyncHandler(async (req, res) => {
  const { isOpen } = req.body;
  const waitingCount = await withTransaction(async (client) => {
    await client.query("UPDATE settings SET shop_open = $1 WHERE id = 1", [isOpen]);
    if (isOpen) {
      await client.query(
        `UPDATE bookings SET hold_expires_at = now() + make_interval(mins => $1),
           reminder_count = 0, last_reminder_at = now()
         WHERE status = $2 AND hold_expires_at IS NULL AND ${SLOT_END_SQL} > now()`,
        [DEFAULT_OWNER_CONFIRM_WINDOW_MINUTES, BOOKING_STATUS.AWAITING_CONFIRMATION]);
    } else {
      await client.query("UPDATE bookings SET hold_expires_at = NULL WHERE status = $1", [BOOKING_STATUS.AWAITING_CONFIRMATION]);
    }
    await expireStaleBookings(client);
    const { rows: [{ count }] } = await client.query("SELECT count(*)::int AS count FROM bookings WHERE status = $1", [BOOKING_STATUS.AWAITING_CONFIRMATION]);
    return count;
  });
  if (isOpen && waitingCount > 0) sendWaitingSummary(waitingCount);
  res.json(new ApiResponse(200, isOpen ? "Shop is open" : "Shop is closed", { shopOpen: isOpen, waitingCount }));
});





// import { BOOKING_STATUS, DEFAULT_OWNER_CONFIRM_WINDOW_MINUTES } from "../../../../constants.js";
// import { ApiResponse } from "../../../../utils/basic/ApiResponse.js";
// import { asyncHandler } from "../../../../utils/basic/asyncHandler.js";
// import { withTransaction } from "../../../../utils/handlers/withTransaction.js";
// import { SLOT_START_SQL } from "../../../booking/logic/bookingSql.js";
// import { expireStaleBookings } from "../../../booking/logic/expireStaleBookings.js";
// import { sendWaitingSummary } from "../../../../services/mail.service.js";

// // ==========================================
// // * SHOP ON/OFF: ON restarts the owner timers of waiting bookings, OFF pauses them
// // ==========================================
// export const setShopStatus = asyncHandler(async (req, res) => {
//   const { isOpen } = req.body;
//   const waitingCount = await withTransaction(async (client) => {
//     await client.query("UPDATE settings SET shop_open = $1 WHERE id = 1", [isOpen]);
//     if (isOpen) {
//       await client.query(
//         `UPDATE bookings SET hold_expires_at = LEAST(now() + make_interval(mins => $1), ${SLOT_START_SQL}),
//            reminder_count = 0, last_reminder_at = now()
//          WHERE status = $2 AND hold_expires_at IS NULL AND ${SLOT_START_SQL} > now()`,
//         [DEFAULT_OWNER_CONFIRM_WINDOW_MINUTES, BOOKING_STATUS.AWAITING_CONFIRMATION]);
//     } else {
//       await client.query("UPDATE bookings SET hold_expires_at = NULL WHERE status = $1", [BOOKING_STATUS.AWAITING_CONFIRMATION]);
//     }
//     await expireStaleBookings(client);
//     const { rows: [{ count }] } = await client.query("SELECT count(*)::int AS count FROM bookings WHERE status = $1", [BOOKING_STATUS.AWAITING_CONFIRMATION]);
//     return count;
//   });
//   if (isOpen && waitingCount > 0) sendWaitingSummary(waitingCount);
//   res.json(new ApiResponse(200, isOpen ? "Shop is open" : "Shop is closed", { shopOpen: isOpen, waitingCount }));
// });
