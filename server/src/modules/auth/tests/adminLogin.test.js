import { describe, expect, it } from "vitest";
import { generateAdminToken, verifyAdminToken } from "../../../utils/security/adminToken.util.js";
import { env } from "../../../config/env.js";

describe("admin token utility", () => {
  it("generates and verifies a valid admin token", () => {
    const adminEmail = env.ownerEmails[0] || "admin@gmail.com";
    const token = generateAdminToken(adminEmail);
    expect(token).toMatch(/^admin\./);

    const payload = verifyAdminToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.email).toBe(adminEmail.toLowerCase());
    expect(payload?.isOwner).toBe(true);
  });

  it("rejects tampered tokens", () => {
    const adminEmail = env.ownerEmails[0] || "admin@gmail.com";
    const token = generateAdminToken(adminEmail);
    const tampered = `${token}tampered`;
    expect(verifyAdminToken(tampered)).toBeNull();
  });

  it("rejects non-owner emails", () => {
    const token = generateAdminToken("random_user@gmail.com");
    expect(verifyAdminToken(token)).toBeNull();
  });

  it("rejects malformed tokens", () => {
    expect(verifyAdminToken("not-an-admin-token")).toBeNull();
    expect(verifyAdminToken("admin.invalid")).toBeNull();
    expect(verifyAdminToken(null)).toBeNull();
  });
});
