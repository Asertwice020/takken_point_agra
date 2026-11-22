import { describe, expect, it } from "vitest";
import { TICKET_REASONS } from "../../../constants.js";
import { evaluateTicket } from "../logic/evaluateTicket.js";

// Slot: 17 Nov 2026, 14:00 to 15:00 IST (08:30Z to 09:30Z)
const booking = { status: "CONFIRMED", booking_date: "2026-11-17", start_time: "14:00:00", duration_minutes: 60 };
const at = (time) => evaluateTicket({ booking, now: new Date(`2026-11-17T${time}Z`) });

describe("evaluateTicket", () => {
  it("is valid from 15 minutes before the slot", () => expect(at("08:15:00").isValid).toBe(true));
  it("is too early before that", () => expect(at("08:14:00").reason).toBe(TICKET_REASONS.TOO_EARLY));
  it("is valid until the last minute of the slot", () => expect(at("09:29:00").isValid).toBe(true));
  it("is rejected once the slot has ended", () => expect(at("09:30:00").reason).toBe(TICKET_REASONS.SLOT_ENDED));
  it("is rejected on a different date", () =>
    expect(evaluateTicket({ booking: { ...booking, booking_date: "2026-11-18" }, now: new Date("2026-11-17T08:30:00Z") }).reason).toBe(TICKET_REASONS.WRONG_DATE));
  it("rejects used, unconfirmed and unknown tickets", () => {
    const now = new Date("2026-11-17T08:30:00Z");
    expect(evaluateTicket({ booking: { ...booking, status: "USED" }, now }).reason).toBe(TICKET_REASONS.ALREADY_USED);
    expect(evaluateTicket({ booking: { ...booking, status: "AWAITING_CONFIRMATION" }, now }).reason).toBe(TICKET_REASONS.NOT_CONFIRMED);
    expect(evaluateTicket({ booking: undefined, now }).reason).toBe(TICKET_REASONS.NOT_FOUND);
  });
});
