import * as z from "zod";

export const loginSchema = z.object({
  tenantId: z.string().min(3, "Tenant ID must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  persistSession: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  tenantId: z
    .string()
    .min(3, "Tenant ID must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Lowercase alphanumeric and dashes only"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
      "Must include uppercase, lowercase, number, and special character (@$!%*?&#)",
    ),
  role: z.enum(["CLIENT", "FREELANCER"], {
    error: "Please select your account type",
  }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
