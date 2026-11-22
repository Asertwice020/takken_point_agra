import { isAxiosError } from "axios";

const MESSAGES: Record<string, string> = {
  SLOT_FULL: "That slot was just taken. Please pick another time.",
  SLOT_PAST: "That time has already passed. Please pick a later time.",
  CUTOFF_PASSED: "Booking for that slot has closed. Please pick a later time.",
  OUTSIDE_BOOKING_WINDOW: "That day is not open for booking yet.",
  OUTSIDE_OPENING_HOURS: "That time is outside our opening hours.",
  INVALID_SLOT: "That slot is not available. Please pick another.",
  ACTIVE_BOOKING_EXISTS: "You have too many unfinished bookings. Please finish paying, or wait for them to be confirmed.",
  DUPLICATE_UTR: "This UTR has already been used. Please check the number.",
  HOLD_EXPIRED: "Your seat hold has expired. Please book again.",
  INVALID_BOOKING_STATE: "This booking can no longer be changed.",
  RATE_LIMITED: "Too many attempts. Please wait a moment and try again.",
  UNAUTHORIZED: "Please log in again.",
  FORBIDDEN: "This account cannot do that.",
  BOOKING_NOT_FOUND: "That booking could not be found.",
  VALIDATION_FAILED: "Please check the details and try again.",
};

export const getApiErrorCode = (error: unknown): string | null =>
  isAxiosError(error) ? (error.response?.data?.errorCode ?? null) : null;

// * These server messages are already written for customers (for example "Rescheduling closes 2 hours before the slot")
const SERVER_MESSAGE_CODES = ["RESCHEDULE_NOT_ALLOWED", "SEAT_TAKEN"];

export const getErrorMessage = (error: unknown): string => {
  const code = getApiErrorCode(error);
  if (code && SERVER_MESSAGE_CODES.includes(code) && isAxiosError(error) && error.response?.data?.message) return error.response.data.message;
  return MESSAGES[code ?? ""] ?? "Something went wrong. Please try again.";
};
