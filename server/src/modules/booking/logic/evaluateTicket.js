import { BOOKING_STATUS, TICKET_EARLY_ENTRY_MINUTES, TICKET_REASONS } from "../../../constants.js";
import { getTodayIst, toSlotStartDate } from "../../../utils/basic/time.util.js";

// ==========================================
// * PURE: can this ticket be used right now?
// ==========================================
export const evaluateTicket = ({ booking, now = new Date() }) => {
  const reject = (reason) => ({ isValid: false, reason });
  if (!booking) return reject(TICKET_REASONS.NOT_FOUND);
  if (booking.status === BOOKING_STATUS.USED) return reject(TICKET_REASONS.ALREADY_USED);
  if (booking.status !== BOOKING_STATUS.CONFIRMED) return reject(TICKET_REASONS.NOT_CONFIRMED);
  if (booking.booking_date !== getTodayIst(now)) return reject(TICKET_REASONS.WRONG_DATE);

  const slotStart = toSlotStartDate(booking.booking_date, booking.start_time).getTime();
  const slotEnd = slotStart + booking.duration_minutes * 60000;
  if (now.getTime() < slotStart - TICKET_EARLY_ENTRY_MINUTES * 60000) return reject(TICKET_REASONS.TOO_EARLY);
  if (now.getTime() >= slotEnd) return reject(TICKET_REASONS.SLOT_ENDED);
  return { isValid: true, reason: null };
};
