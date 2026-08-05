"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ModalShell } from "@/components/ui/modal-shell";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SelectDropdown, type SelectOption } from "@/components/ui/select-dropdown";
import { useCreateAdminUserMutation } from "@/features/admin/hooks/use-admin";
import type { Role } from "@/features/auth/types/auth.types";
import { useAuthStore } from "@/features/auth/store/auth.store";

const roleOptions: SelectOption<Role>[] = [
  { value: "CLIENT", label: "Client" },
  { value: "FREELANCER", label: "Freelancer" },
  { value: "ADMIN", label: "Administrator" },
];

const createUserSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must contain at least 2 characters.").max(100),
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(100)
    .regex(/[a-z]/, "Add a lowercase letter.")
    .regex(/[A-Z]/, "Add an uppercase letter.")
    .regex(/\d/, "Add a number.")
    .regex(/[@$!%*?&#]/, "Add a special character: @$!%*?&#"),
  role: z.enum(["ADMIN", "CLIENT", "FREELANCER"]),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const tenantId = useAuthStore((state) => state.user?.tenantId) || "default";
  const { mutate: createUser, isPending } = useCreateAdminUserMutation();
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { fullName: "", email: "", password: "", role: "CLIENT" },
  });
  const role = useWatch({ control, name: "role" }) ?? "CLIENT";

  React.useEffect(() => {
    if (isOpen) {
      reset({ fullName: "", email: "", password: "", role: "CLIENT" });
    }
  }, [isOpen, reset]);

  const handleClose = () => {
    if (isPending) return;
    reset();
    onClose();
  };

  const onSubmit = (data: CreateUserForm) => {
    createUser(data, { onSuccess: handleClose });
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      isPending={isPending}
      title="Create User"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="admin-create-user-form" isLoading={isPending}>
            {isPending ? "Creating..." : "Create User"}
          </Button>
        </>
      }
    >
      <form id="admin-create-user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField label="Workspace / Tenant ID">
          <Input
            value={tenantId}
            readOnly
            aria-readonly="true"
            className="cursor-not-allowed bg-surface-sunken text-content-secondary"
          />
        </FormField>
        <FormField label="Full Name" required error={errors.fullName?.message}>
          <Input {...register("fullName")} placeholder="e.g. Jordan Lee" disabled={isPending} isError={Boolean(errors.fullName)} />
        </FormField>
        <FormField label="Email" required error={errors.email?.message}>
          <Input {...register("email")} type="email" placeholder="name@company.com" disabled={isPending} isError={Boolean(errors.email)} />
        </FormField>
        <FormField label="Temporary Password" required error={errors.password?.message}>
          <Input {...register("password")} type="password" placeholder="At least 8 strong characters" disabled={isPending} isError={Boolean(errors.password)} />
        </FormField>
        <FormField label="Role" required error={errors.role?.message}>
          <SelectDropdown
            options={roleOptions}
            value={role}
            onChange={(value) => setValue("role", value, { shouldValidate: true })}
            disabled={isPending}
          />
        </FormField>
        <p className="text-xs leading-relaxed text-content-muted">
          The account is created in this workspace and becomes active immediately. Tenant assignment cannot be changed here.
        </p>
      </form>
    </ModalShell>
  );
}
