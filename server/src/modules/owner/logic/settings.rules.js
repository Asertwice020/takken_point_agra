import { BLOCK_MINUTES, ERROR_CODES } from "../../../constants.js";
import { ApiError } from "../../../utils/basic/ApiError.js";
import { timeToMinutes } from "../../../utils/basic/time.util.js";

// ==========================================
// * PURE: merge a partial update into the current settings, then validate
// ==========================================
const FIELD_TO_COLUMN = Object.freeze({
  openTime: "open_time", closeTime: "close_time", bookingDaysAhead: "booking_days_ahead",
  cutoffMinutes: "cutoff_minutes", rescheduleCutoffHours: "reschedule_cutoff_hours", maxReschedules: "max_reschedules", stations: "stations",
});

export const mergeSettings = (current, changes) => {
  const merged = { ...current };
  for (const [field, column] of Object.entries(FIELD_TO_COLUMN)) {
    if (changes[field] !== undefined) merged[column] = changes[field];
  }
  return merged;
};

export const assertSettingsValid = (settings) => {
  const open = timeToMinutes(settings.open_time);
  const close = timeToMinutes(settings.close_time);
  if (open % BLOCK_MINUTES !== 0 || close % BLOCK_MINUTES !== 0 || close <= open) {
    throw new ApiError(400, "Opening hours must be on 30-minute steps, and closing must be after opening").setErrorCode(ERROR_CODES.VALIDATION_FAILED);
  }
};





// import { BLOCK_MINUTES, ERROR_CODES } from "../../../constants.js";
// import { ApiError } from "../../../utils/basic/ApiError.js";
// import { timeToMinutes } from "../../../utils/basic/time.util.js";

// // ==========================================
// // * PURE: merge a partial update into the current settings, then validate
// // ==========================================
// const FIELD_TO_COLUMN = Object.freeze({
//   openTime: "open_time", closeTime: "close_time", bookingDaysAhead: "booking_days_ahead",
//   cutoffMinutes: "cutoff_minutes", rescheduleCutoffHours: "reschedule_cutoff_hours", maxReschedules: "max_reschedules",
// });

// export const mergeSettings = (current, changes) => {
//   const merged = { ...current };
//   for (const [field, column] of Object.entries(FIELD_TO_COLUMN)) {
//     if (changes[field] !== undefined) merged[column] = changes[field];
//   }
//   return merged;
// };

// export const assertSettingsValid = (settings) => {
//   const open = timeToMinutes(settings.open_time);
//   const close = timeToMinutes(settings.close_time);
//   if (open % BLOCK_MINUTES !== 0 || close % BLOCK_MINUTES !== 0 || close <= open) {
//     throw new ApiError(400, "Opening hours must be on 30-minute steps, and closing must be after opening").setErrorCode(ERROR_CODES.VALIDATION_FAILED);
//   }
// };
