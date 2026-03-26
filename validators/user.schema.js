import { z } from "zod";

const roleSchema = z.enum(["admin", "manager", "employee"]);

export const signupSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.email({ message: "Invalid email" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  role: roleSchema.optional(),
});

export const loginSchema = z.object({
  email: z.email({ message: "Invalid email" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { message: "Refresh token is required" }),
});

export const forgotPasswordSchema = z.object({
  email: z.email({ message: "Invalid email" }),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(1, { message: "Name cannot be empty" }).optional(),
    email: z.email({ message: "Invalid email" }).optional(),
    role: roleSchema.optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    {
      message: "At least one field is required",
    },
  );
