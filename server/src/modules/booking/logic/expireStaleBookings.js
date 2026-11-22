import { pool } from "../../../config/db.js";
import { BOOKING_STATUS } from "../../../constants.js";
import { SLOT_END_SQL, UNCONFIRMED_STATUS_LIST } from "./bookingSql.js";

// * Expired = the owner's 30 minutes ran out, or (paused timer, shop closed) the slot has already ended
export const expireStaleBookings = (db = pool) =>
  db.query(
    `UPDATE bookings SET status = '${BOOKING_STATUS.EXPIRED}'
     WHERE status IN ${UNCONFIRMED_STATUS_LIST}
     AND ((hold_expires_at IS NOT NULL AND hold_expires_at <= now())
          OR (hold_expires_at IS NULL AND ${SLOT_END_SQL} <= now()))`);



// import { pool } from "../../../config/db.js";
// import { BOOKING_STATUS } from "../../../constants.js";
// import { SLOT_START_SQL, UNCONFIRMED_STATUS_LIST } from "./bookingSql.js";

// // * Expired = hold ran out, or (paused hold) the slot has already started
// export const expireStaleBookings = (db = pool) =>
//   db.query(
//     `UPDATE bookings SET status = '${BOOKING_STATUS.EXPIRED}'
//      WHERE status IN ${UNCONFIRMED_STATUS_LIST}
//      AND ((hold_expires_at IS NOT NULL AND hold_expires_at <= now())
//           OR (hold_expires_at IS NULL AND ${SLOT_START_SQL} <= now()))`);
