import { z } from "zod";

export const loginSchema = z.object({
  password: z.string().min(1, "Enter the dashboard password"),
  next: z
    .string()
    .optional()
    // Only allow same-site relative paths to prevent open redirects.
    .transform((value) => (value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard")),
});

export type LoginState = { error?: string; fieldError?: string } | undefined;
