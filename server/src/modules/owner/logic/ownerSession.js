import crypto from "node:crypto";

// ==========================================
// * PURE: owner login token (signed with a key made from OWNER_PASS; no database, no packages)
// ==========================================
export const OWNER_SESSION_HOURS = 16;

const sha256 = (value) => crypto.createHash("sha256").update(String(value)).digest();
const sign = (payload, key) => crypto.createHmac("sha256", key).update(payload).digest("base64url");

// * Changing OWNER_PASS in .env instantly logs every owner out
export const getSessionKey = (password) => sha256(`tpa-owner-session:${password}`);

// * Constant-time comparison, so response time never hints at how close a guess was
export const isSamePassword = (given, expected) => crypto.timingSafeEqual(sha256(given), sha256(expected));

export const signOwnerToken = ({ email }, key, now = Date.now()) => {
  const expiresAt = now + OWNER_SESSION_HOURS * 3600000;
  const payload = Buffer.from(JSON.stringify({ email, exp: expiresAt })).toString("base64url");
  return { token: `${payload}.${sign(payload, key)}`, expiresAt };
};

export const verifyOwnerToken = (token, key, now = Date.now()) => {
  if (typeof token !== "string") return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return null;
  const given = Buffer.from(signature);
  const expected = Buffer.from(sign(payload, key));
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return data.exp > now ? { email: data.email } : null;
  } catch {
    return null;
  }
};
