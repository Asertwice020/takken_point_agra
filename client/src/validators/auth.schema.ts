import { z } from "zod";

export const emailSchema = z.object({ email: z.string().trim().toLowerCase().max(254).email("Enter a valid email address") });
export const otpSchema = z.object({ code: z.string().trim().regex(/^\d{6,8}$/, "Enter the 6-digit code from your email") });
export const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(60, "Name is too long")
    .regex(/^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u, "Use letters only"),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number starting with 6, 7, 8 or 9"),
});

export type EmailForm = z.infer<typeof emailSchema>;
export type OtpForm = z.infer<typeof otpSchema>;
export type ProfileForm = z.infer<typeof profileSchema>;
