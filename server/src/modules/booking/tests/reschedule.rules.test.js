import { describe, expect, it } from "vitest";
import { ERROR_CODES } from "../../../constants.js";
import { assertReschedulable, getRescheduleBlockMessage } from "../logic/reschedule.rules.js";

const settings = { open_time: "11:00:00", close_time: "22:00:00", booking_days_ahead: 1, cutoff_minutes: 5, reschedule_cutoff_hours: 2, max_reschedules: 1 };
const booking = { status: "CONFIRMED", booking_date: "2026-11-16", start_time: "14:00:00", duration_minutes: 60, reschedule_count: 0 };
const NOW = new Date("2026-11-16T04:30:00Z"); // 10:00 IST
const attempt = (overrides = {}, now = NOW) => {
  try {
    assertReschedulable({ booking: { ...booking, ...overrides.booking }, newDate: "2026-11-17", newStartTime: "11:00", settings, now, ...overrides.input });
    return null;
  } catch (error) { return error.errorCode; }
};

describe("reschedule rules", () => {
  it("allows a confirmed booking more than 2 hours ahead", () => expect(attempt()).toBeNull());
  it("allows exactly 2 hours before", () => expect(attempt({}, new Date("2026-11-16T06:30:00Z"))).toBeNull());
  it("blocks inside 2 hours", () => expect(attempt({}, new Date("2026-11-16T06:31:00Z"))).toBe(ERROR_CODES.RESCHEDULE_NOT_ALLOWED));
  it("blocks after the limit is reached", () => expect(attempt({ booking: { reschedule_count: 1 } })).toBe(ERROR_CODES.RESCHEDULE_NOT_ALLOWED));
  it("blocks unconfirmed bookings", () => expect(attempt({ booking: { status: "AWAITING_CONFIRMATION" } })).toBe(ERROR_CODES.RESCHEDULE_NOT_ALLOWED));
  it("rejects moving to the same slot", () => expect(attempt({ input: { newDate: "2026-11-16", newStartTime: "14:00" } })).toBe(ERROR_CODES.RESCHEDULE_NOT_ALLOWED));
  it("applies the normal slot rules to the new slot", () => expect(attempt({ input: { newDate: "2026-11-18" } })).toBe(ERROR_CODES.OUTSIDE_BOOKING_WINDOW));
  it("exposes the reason for the button state", () => expect(getRescheduleBlockMessage({ booking, settings, now: NOW })).toBeNull());
});
