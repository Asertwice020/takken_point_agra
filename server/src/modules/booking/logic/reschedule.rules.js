import { BOOKING_STATUS, ERROR_CODES } from "../../../constants.js";
import { ApiError } from "../../../utils/basic/ApiError.js";
import { timeToMinutes, toSlotStartDate } from "../../../utils/basic/time.util.js";
import { validateSlotRequest } from "./slot.rules.js";

// ==========================================
// * PURE RESCHEDULE RULES
// ==========================================
const rejectReschedule = (message) => new ApiError(409, message).setErrorCode(ERROR_CODES.RESCHEDULE_NOT_ALLOWED);

// * Returns null when allowed, otherwise the reason (also used to show/hide the button)
export const getRescheduleBlockMessage = ({ booking, settings, now = new Date() }) => {
  if (booking.status !== BOOKING_STATUS.CONFIRMED) return "Only confirmed bookings can be rescheduled";
  if (booking.reschedule_count >= settings.max_reschedules) return "Reschedule limit reached for this booking";
  const msUntilStart = toSlotStartDate(booking.booking_date, booking.start_time).getTime() - now.getTime();
  if (msUntilStart < settings.reschedule_cutoff_hours * 3600000) {
    return `Rescheduling closes ${settings.reschedule_cutoff_hours} hours before the slot`;
  }
  return null;
};

// * Same game and same duration only, so the price never changes
export const assertReschedulable = ({ booking, newDate, newStartTime, settings, now = new Date() }) => {
  const blockMessage = getRescheduleBlockMessage({ booking, settings, now });
  if (blockMessage) throw rejectReschedule(blockMessage);

  const isSameSlot = newDate === booking.booking_date && timeToMinutes(newStartTime) === timeToMinutes(booking.start_time);
  if (isSameSlot) throw rejectReschedule("Choose a different time");

  validateSlotRequest({
    bookingDate: newDate, startTime: newStartTime, durationMinutes: booking.duration_minutes,
    allowedDurations: [booking.duration_minutes], settings, now,
  });
};
