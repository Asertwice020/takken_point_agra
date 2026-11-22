import { BOOKING_STATUS } from "../../../constants.js";

// * Slot start and end as real timestamps (India time)
export const SLOT_START_SQL = "((booking_date + start_time) AT TIME ZONE 'Asia/Kolkata')";
export const SLOT_END_SQL = `(${SLOT_START_SQL} + make_interval(mins => duration_minutes))`;
export const UNCONFIRMED_STATUS_LIST = `('${BOOKING_STATUS.PENDING_PAYMENT}', '${BOOKING_STATUS.AWAITING_CONFIRMATION}')`;


// import { BOOKING_STATUS } from "../../../constants.js";

// // * Slot start as a real timestamp (India time)
// export const SLOT_START_SQL = "((booking_date + start_time) AT TIME ZONE 'Asia/Kolkata')";
// export const UNCONFIRMED_STATUS_LIST = `('${BOOKING_STATUS.PENDING_PAYMENT}', '${BOOKING_STATUS.AWAITING_CONFIRMATION}')`;
