export const maskUtr = (utr) => (utr ? `••••${utr.slice(-4)}` : null);
