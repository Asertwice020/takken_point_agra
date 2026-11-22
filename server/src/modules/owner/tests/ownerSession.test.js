import { describe, expect, it } from "vitest";
import { getSessionKey, isSamePassword, signOwnerToken, verifyOwnerToken } from "../logic/ownerSession.js";

const key = getSessionKey("secret-pass");
const NOW = 1_800_000_000_000;

describe("owner session token", () => {
  it("accepts a fresh token", () => {
    const { token } = signOwnerToken({ email: "a@b.com" }, key, NOW);
    expect(verifyOwnerToken(token, key, NOW + 1000)).toEqual({ email: "a@b.com" });
  });
  it("rejects an expired token", () => {
    const { token, expiresAt } = signOwnerToken({ email: "a@b.com" }, key, NOW);
    expect(verifyOwnerToken(token, key, expiresAt + 1)).toBeNull();
  });
  it("rejects a tampered token or a token signed with another password", () => {
    const { token } = signOwnerToken({ email: "a@b.com" }, key, NOW);
    const forged = `${Buffer.from(JSON.stringify({ email: "x@y.com", exp: NOW + 99999999 })).toString("base64url")}.${token.split(".")[1]}`;
    expect(verifyOwnerToken(forged, key, NOW)).toBeNull();
    expect(verifyOwnerToken(token, getSessionKey("other-pass"), NOW)).toBeNull();
    expect(verifyOwnerToken("garbage", key, NOW)).toBeNull();
    expect(verifyOwnerToken(undefined, key, NOW)).toBeNull();
  });
  it("compares passwords exactly", () => {
    expect(isSamePassword("secret-pass", "secret-pass")).toBe(true);
    expect(isSamePassword("secret-pass ", "secret-pass")).toBe(false);
    expect(isSamePassword("", "secret-pass")).toBe(false);
  });
});
