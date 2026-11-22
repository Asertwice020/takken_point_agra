import { z } from "zod";

export const utrSchema = z.object({ utr: z.string().trim().regex(/^\d{12}$/, "The UTR is exactly 12 digits (numbers only)") });
export type UtrForm = z.infer<typeof utrSchema>;
