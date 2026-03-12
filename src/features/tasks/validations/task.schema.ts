import * as z from "zod";
import { TaskStatus, TaskPriority } from "../types/task.types";

export const taskSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters"),
  description: z
    .string()
    .max(5000, "Description must not exceed 5000 characters")
    .optional()
    .nullable(),
  assignedToId: z.string().optional().nullable(),
  priority: z.nativeEnum(TaskPriority, { error: "Priority is required" }),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  estimatedHours: z
    .number({ error: "Must be a number" })
    .min(0, "Cannot be negative")
    .optional()
    .nullable(),
  actualHours: z
    .number({ error: "Must be a number" })
    .min(0, "Cannot be negative")
    .optional()
    .nullable(),
  dueDate: z
    .string()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, { message: "Due date must be in the future or present" })
    .optional()
    .nullable(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;      // output (status always present)
export type TaskFormInputValues = z.input<typeof taskSchema>; // input (status optional in form)