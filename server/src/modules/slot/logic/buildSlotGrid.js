import { BLOCK_MINUTES, ERROR_CODES } from "../../../constants.js";
import { minutesToTime, timeToMinutes } from "../../../utils/basic/time.util.js";
import { computeSeatsLeft, validateSlotRequest } from "../../booking/logic/slot.rules.js";

// ==========================================
// * PURE: one row per possible start time, with seats left and why it is unavailable
// ==========================================
export const buildSlotGrid = ({ bookingDate, durationMinutes, stations, allowedDurations, settings, activeBookings, blockedSeats, now = new Date() }) => {
  const slots = [];
  const closeMinutes = timeToMinutes(settings.close_time);

  for (let start = timeToMinutes(settings.open_time); start + durationMinutes <= closeMinutes; start += BLOCK_MINUTES) {
    const startTime = minutesToTime(start);
    try {
      validateSlotRequest({ bookingDate, startTime, durationMinutes, allowedDurations, settings, now });
    } catch (error) {
      slots.push({ startTime, seatsLeft: 0, isBookable: false, reason: error.errorCode });
      continue;
    }
    const seatsLeft = computeSeatsLeft({ stations, startTime, durationMinutes, activeBookings, blockedSeats });
    slots.push({ startTime, seatsLeft, isBookable: seatsLeft > 0, reason: seatsLeft > 0 ? null : ERROR_CODES.SLOT_FULL });
  }
  return slots;
};
