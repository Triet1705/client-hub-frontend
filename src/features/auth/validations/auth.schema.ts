import * as z from "zod";

export const loginSchema = z.object({
  tenantId: z.string().min(3, "Tenant ID must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  persistSession: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
