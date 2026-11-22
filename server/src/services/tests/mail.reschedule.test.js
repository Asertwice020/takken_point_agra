import { describe, expect, it } from "vitest";
import { buildOwnerPaymentAlertEmail, buildRescheduleEmail } from "../mail.templates.js";

const booking = {
  booking_date: "2026-11-17", start_time: "11:00:00", duration_minutes: 60, amount: 60, game_name: "Taken Tech",
  ticket_code: "AB12CD34", customer_name: "Asha", customer_phone: "9876543210", utr: "123456789012",
};

describe("reminder and reschedule emails", () => {
  it("numbers the reminders", () => {
    expect(buildOwnerPaymentAlertEmail({ booking, dashboardUrl: "https://x.test", reminderNumber: 2 }).subject).toContain("Reminder 2 of 3");
    expect(buildOwnerPaymentAlertEmail({ booking, dashboardUrl: "https://x.test" }).subject).not.toContain("Reminder");
  });
  it("shows the old and new slot", () => {
    const previous = { booking_date: "2026-11-16", start_time: "14:00:00", duration_minutes: 60 };
    const { html } = buildRescheduleEmail({ booking, previous });
    expect(html).toContain("2:00 PM to 3:00 PM");
    expect(html).toContain("11:00 AM to 12:00 PM");
  });
});
