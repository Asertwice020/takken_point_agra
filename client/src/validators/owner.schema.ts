import { z } from "zod";

export const ownerLoginSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password").max(128, "Password is too long"),
});
export type OwnerLoginForm = z.infer<typeof ownerLoginSchema>;
