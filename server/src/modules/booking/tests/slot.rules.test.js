import { describe, expect, it } from "vitest";
import { ERROR_CODES } from "../../../constants.js";
import { getTodayIst } from "../../../utils/basic/time.util.js";
import { computeSeatsLeft, validateSlotRequest } from "../logic/slot.rules.js";

const settings = { open_time: "11:00:00", close_time: "22:00:00", booking_days_ahead: 1, cutoff_minutes: 5 };
const NOW = new Date("2026-11-16T10:00:00Z"); // 15:30 IST, 16 Nov 2026
const check = (overrides, now = NOW) =>
  validateSlotRequest({ bookingDate: "2026-11-17", startTime: "11:00", durationMinutes: 60, allowedDurations: [30, 60], settings, now, ...overrides });
const errorCodeOf = (fn) => { try { fn(); } catch (error) { return error.errorCode; } return null; };

describe("validateSlotRequest", () => {
  it("accepts a valid slot tomorrow", () => expect(errorCodeOf(() => check({}))).toBeNull());
  it("rejects a past slot today", () =>
    expect(errorCodeOf(() => check({ bookingDate: "2026-11-16", startTime: "14:00" }))).toBe(ERROR_CODES.SLOT_PAST));
  it("rejects inside the 5-minute cutoff", () =>
    expect(errorCodeOf(() => check({ bookingDate: "2026-11-16", startTime: "15:30" }, new Date("2026-11-16T09:57:00Z")))).toBe(ERROR_CODES.CUTOFF_PASSED));
  it("accepts exactly 5 minutes before the slot", () =>
    expect(errorCodeOf(() => check({ bookingDate: "2026-11-16", startTime: "15:30" }, new Date("2026-11-16T09:55:00Z")))).toBeNull());
  it("rejects dates beyond the booking window", () =>
    expect(errorCodeOf(() => check({ bookingDate: "2026-11-18" }))).toBe(ERROR_CODES.OUTSIDE_BOOKING_WINDOW));
  it("rejects a slot ending after closing time", () =>
    expect(errorCodeOf(() => check({ startTime: "21:30" }))).toBe(ERROR_CODES.OUTSIDE_OPENING_HOURS));
  it("rejects off-grid start times and unoffered durations", () => {
    expect(errorCodeOf(() => check({ startTime: "11:15" }))).toBe(ERROR_CODES.INVALID_SLOT);
    expect(errorCodeOf(() => check({ durationMinutes: 90 }))).toBe(ERROR_CODES.INVALID_SLOT);
  });
  it("uses India date around midnight", () => expect(getTodayIst(new Date("2026-11-16T19:00:00Z"))).toBe("2026-11-17"));
});

describe("computeSeatsLeft", () => {
  const base = { stations: 2, blockedSeats: [] };
  const oneHourAt11 = { start_time: "11:00:00", duration_minutes: 60 };
  it("a 1-hour booking occupies two blocks", () => {
    expect(computeSeatsLeft({ ...base, startTime: "11:30", durationMinutes: 30, activeBookings: [oneHourAt11] })).toBe(1);
    expect(computeSeatsLeft({ ...base, startTime: "12:00", durationMinutes: 30, activeBookings: [oneHourAt11] })).toBe(2);
  });
  it("is full after two overlapping bookings", () =>
    expect(computeSeatsLeft({ ...base, startTime: "11:30", durationMinutes: 60, activeBookings: [oneHourAt11, oneHourAt11] })).toBe(0));
  it("blocked seats reduce availability", () =>
    expect(computeSeatsLeft({ ...base, startTime: "11:00", durationMinutes: 30, activeBookings: [], blockedSeats: [{ start_time: "11:00:00", seats: 1 }] })).toBe(1));
});
