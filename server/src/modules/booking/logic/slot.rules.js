import { BLOCK_MINUTES, ERROR_CODES } from "../../../constants.js";
import { ApiError } from "../../../utils/basic/ApiError.js";
import {
  addDaysToDateString, getTodayIst, minutesToTime, timeToMinutes, toSlotStartDate,
} from "../../../utils/basic/time.util.js";

// ==========================================
// * PURE RULES (no database, fully testable)
// ==========================================
const rejectSlot = (statusCode, message, code) => new ApiError(statusCode, message).setErrorCode(code);

export const getBlockStarts = (startTime, durationMinutes) => {
  const start = timeToMinutes(startTime);
  return Array.from({ length: durationMinutes / BLOCK_MINUTES }, (_, i) => minutesToTime(start + i * BLOCK_MINUTES));
};

export const validateSlotRequest = ({ bookingDate, startTime, durationMinutes, allowedDurations, settings, now = new Date() }) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;

  if (!allowedDurations.includes(durationMinutes) || durationMinutes % BLOCK_MINUTES !== 0 || startMinutes % BLOCK_MINUTES !== 0) {
    throw rejectSlot(400, "Invalid slot", ERROR_CODES.INVALID_SLOT);
  }
  if (startMinutes < timeToMinutes(settings.open_time) || endMinutes > timeToMinutes(settings.close_time)) {
    throw rejectSlot(400, "Slot is outside opening hours", ERROR_CODES.OUTSIDE_OPENING_HOURS);
  }

  const today = getTodayIst(now);
  if (bookingDate < today) throw rejectSlot(400, "Slot is in the past", ERROR_CODES.SLOT_PAST);
  if (bookingDate > addDaysToDateString(today, settings.booking_days_ahead)) {
    throw rejectSlot(400, "Date is outside the booking window", ERROR_CODES.OUTSIDE_BOOKING_WINDOW);
  }

  const msUntilStart = toSlotStartDate(bookingDate, startTime).getTime() - now.getTime();
  if (msUntilStart <= 0) throw rejectSlot(400, "Slot is in the past", ERROR_CODES.SLOT_PAST);
  if (msUntilStart < settings.cutoff_minutes * 60000) {
    throw rejectSlot(400, "Booking for this slot has closed", ERROR_CODES.CUTOFF_PASSED);
  }
};

// * Seats left = fewest free seats across every 30-minute block the slot covers
export const computeSeatsLeft = ({ stations, startTime, durationMinutes, activeBookings, blockedSeats }) => {
  const freeSeatsPerBlock = getBlockStarts(startTime, durationMinutes).map((blockStart) => {
    const blockMinutes = timeToMinutes(blockStart);
    const bookedCount = activeBookings.filter((booking) => {
      const bookingStart = timeToMinutes(booking.start_time);
      return blockMinutes >= bookingStart && blockMinutes < bookingStart + booking.duration_minutes;
    }).length;
    const blockedCount = blockedSeats
      .filter((blocked) => timeToMinutes(blocked.start_time) === blockMinutes)
      .reduce((sum, blocked) => sum + blocked.seats, 0);
    return stations - bookedCount - blockedCount;
  });
  return Math.max(0, Math.min(...freeSeatsPerBlock));
};
