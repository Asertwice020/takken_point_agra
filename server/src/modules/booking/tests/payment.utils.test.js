import { describe, expect, it } from "vitest";
import { maskUtr } from "../../../utils/basic/mask.util.js";
import { buildUpiLink } from "../logic/buildUpiLink.js";

describe("buildUpiLink", () => {
  it("builds a UPI link with amount and booking code", () =>
    expect(buildUpiLink({ upiId: "shop@upi", payeeName: "Taken Point Agra", amount: 35, ticketCode: "AB12CD34" }))
      .toBe("upi://pay?pa=shop@upi&pn=Taken%20Point%20Agra&am=35.00&cu=INR&tn=TP-AB12CD34"));
});

describe("maskUtr", () => {
  it("shows only the last 4 digits", () => expect(maskUtr("123456789012")).toBe("••••9012"));
  it("handles a missing UTR", () => expect(maskUtr(null)).toBeNull());
});
