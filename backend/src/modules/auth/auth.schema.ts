import { z } from "zod";

export const signupSchema = z.object({
  workspaceName: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters.")
    .max(80, "Workspace name must be 80 characters or fewer."),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(80, "Full name must be 80 characters or fewer."),
  email: z
    .email("Enter a valid email address.")
    .trim()
    .toLowerCase()
    .max(254, "Email address is too long."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z
    .email("Enter a valid email address.")
    .trim()
    .toLowerCase()
    .max(254, "Email address is too long."),
  password: z
    .string()
    .min(1, "Password is required.")
    .max(72, "Password must be 72 characters or fewer."),
});

export type LoginInput = z.infer<typeof loginSchema>;
