import { describe, expect, it } from "vitest";
import { formatTime12h } from "../../utils/basic/time.util.js";
import { buildOwnerPaymentAlertEmail, buildTicketEmail } from "../mail.templates.js";

const booking = {
  booking_date: "2026-11-17", start_time: "14:00:00", duration_minutes: 60, amount: 60, game_name: "Taken Tech",
  ticket_code: "AB12CD34", customer_name: "<script>alert(1)</script>", customer_phone: "9876543210", utr: "123456789012",
};

describe("mail templates", () => {
  it("escapes customer-provided text", () => {
    const { html } = buildOwnerPaymentAlertEmail({ booking, dashboardUrl: "https://x.test/admin" });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
  it("shows the full UTR in the owner alert", () => {
    const { html } = buildOwnerPaymentAlertEmail({ booking, dashboardUrl: "https://x.test/admin" });
    expect(html).toContain("123456789012");
  });
  it("ticket email shows the slot in 12-hour time", () => {
    expect(buildTicketEmail({ booking }).html).toContain("2:00 PM to 3:00 PM");
  });
  it("formats 12-hour times", () => {
    expect(formatTime12h("00:30:00")).toBe("12:30 AM");
    expect(formatTime12h("12:00")).toBe("12:00 PM");
  });
});
