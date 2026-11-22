// * First line of defence: bad characters never even appear in the field (typing and pasting).
// * Zod validation and the server still check everything again.
export const onlyDigits = (maxLength: number) => (value: string) => value.replace(/\D/g, "").slice(0, maxLength);

export const sanitizeOtp = onlyDigits(8);
export const sanitizePhone = onlyDigits(10);
export const sanitizeUtr = onlyDigits(12);

export const cleanEmail = (value: string) => value.replace(/\s/g, "").toLowerCase().slice(0, 254);

// * Letters (any language), spaces, dots, apostrophes and hyphens only
export const cleanName = (value: string) =>
  value.replace(/[^\p{L}\p{M}\s.'-]/gu, "").replace(/\s{2,}/g, " ").replace(/^\s+/, "").slice(0, 60);
