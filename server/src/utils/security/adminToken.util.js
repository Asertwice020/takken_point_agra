import crypto from "node:crypto";
import { env } from "../../config/env.js";

const TOKEN_PREFIX = "admin.";

const getSecret = () => {
  const secretKey = env.ownerPass || env.supabasePublishableKey || "fallback-admin-secret";
  return crypto.createHash("sha256").update(secretKey).digest("hex");
};

export const generateAdminToken = (email) => {
  const payload = {
    sub: "admin",
    email: email.toLowerCase(),
    isOwner: true,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", getSecret()).update(payloadStr).digest("base64url");
  return `${TOKEN_PREFIX}${payloadStr}.${signature}`;
};

export const verifyAdminToken = (token) => {
  if (!token || typeof token !== "string" || !token.startsWith(TOKEN_PREFIX)) return null;
  const parts = token.slice(TOKEN_PREFIX.length).split(".");
  if (parts.length !== 2) return null;

  const [payloadStr, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", getSecret()).update(payloadStr).digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadStr, "base64url").toString("utf8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    if (!env.ownerEmails.includes(payload.email)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};
