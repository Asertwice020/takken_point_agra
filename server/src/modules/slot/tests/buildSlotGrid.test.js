import { describe, expect, it } from "vitest";
import { ERROR_CODES } from "../../../constants.js";
import { buildSlotGrid } from "../logic/buildSlotGrid.js";

const settings = { open_time: "11:00:00", close_time: "22:00:00", booking_days_ahead: 1, cutoff_minutes: 5 };
const NOW = new Date("2026-11-16T10:00:00Z"); // 15:30 IST, 16 Nov 2026
const grid = (overrides) => buildSlotGrid({
  bookingDate: "2026-11-17", durationMinutes: 30, stations: 2, allowedDurations: [30, 60],
  settings, activeBookings: [], blockedSeats: [], now: NOW, ...overrides,
});

describe("buildSlotGrid", () => {
  it("lists every 30-minute start up to the last possible one", () => {
    const slots = grid({});
    expect(slots).toHaveLength(22);
    expect(slots.at(-1).startTime).toBe("21:30");
    expect(slots[0]).toMatchObject({ startTime: "11:00", seatsLeft: 2, isBookable: true });
  });
  it("1-hour grid ends at 21:00", () => {
    const slots = grid({ durationMinutes: 60 });
    expect(slots).toHaveLength(21);
    expect(slots.at(-1).startTime).toBe("21:00");
  });
  it("marks past slots today and keeps later ones bookable", () => {
    const slots = grid({ bookingDate: "2026-11-16" });
    expect(slots.find((slot) => slot.startTime === "15:00").reason).toBe(ERROR_CODES.SLOT_PAST);
    expect(slots.find((slot) => slot.startTime === "16:00").isBookable).toBe(true);
  });
  it("marks full slots", () => {
    const full = { start_time: "11:00:00", duration_minutes: 60 };
    const slots = grid({ activeBookings: [full, full] });
    expect(slots[0]).toMatchObject({ seatsLeft: 0, isBookable: false, reason: ERROR_CODES.SLOT_FULL });
    expect(slots[2].isBookable).toBe(true);
  });
});
