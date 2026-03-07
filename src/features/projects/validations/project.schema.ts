import * as z from "zod";
import { ProjectStatus } from "../types/project.types";

export const projectSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must not exceed 200 characters"),
  description: z.string().optional(),
  budget: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(
      z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, "Budget must be a valid number (e.g. 1500 or 1500.50)")
        .optional()
    ),
  deadline: z
    .string()
    .optional()
    .refine(
      (dateString) => {
        if (!dateString) return true;
        const selectedDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      { message: "Deadline cannot be in the past" }
    ),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.PLANNING),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
export type ProjectFormInputValues = z.input<typeof projectSchema>;