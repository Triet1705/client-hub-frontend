"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { AuthInput } from "@/components/ui/auth-input";
import {
  WorkspaceDomainIcon,
  EmailIcon,
  PasswordIcon,
  PersonIcon,
} from "@/components/icons";
import { setTenantIdCookie } from "@/lib/cookies";
import { registerUser } from "../api/auth.api";
import {
  registerSchema,
  type RegisterFormValues,
} from "../validations/auth.schema";

export function RegisterForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      tenantId: "",
      fullName: "",
      email: "",
      password: "",
      role: undefined,
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const tenantId = data.tenantId.trim().toLowerCase();
      const response = await registerUser(
        {
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          role: data.role,
        },
        tenantId,
      );

      setTenantIdCookie(tenantId);

      toast.success("Workspace Provisioned!", {
        description: `Welcome to Client Hub, ${response.full_name}. Please sign in.`,
      });

      router.push("/login");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg =
        err.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error("Provisioning Failed", { description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-slate-400 font-medium">I am joining as a...</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue("role", "FREELANCER", { shouldValidate: true })}
            className={`h-16 rounded-lg border-2 font-semibold text-sm transition-all flex flex-col items-center justify-center gap-1 ${
              selectedRole === "FREELANCER"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-500"
            }`}
          >
            <span>Freelancer</span>
          </button>
          <button
            type="button"
            onClick={() => setValue("role", "CLIENT", { shouldValidate: true })}
            className={`h-16 rounded-lg border-2 font-semibold text-sm transition-all flex flex-col items-center justify-center gap-1 ${
              selectedRole === "CLIENT"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-500"
            }`}
          >
            <span>Client</span>
          </button>
        </div>
        {errors.role && (
          <p className="text-xs text-red-400 mt-1">{errors.role.message}</p>
        )}
      </div>

      <AuthInput
        label="Workspace Name / Tenant ID"
        icon={WorkspaceDomainIcon}
        placeholder="agency-alpha-hq"
        error={errors.tenantId?.message}
        {...register("tenantId")}
      />

      <AuthInput
        label="Full Name"
        icon={PersonIcon}
        placeholder="Alex Rivera"
        error={errors.fullName?.message}
        {...register("fullName")}
      />

      <AuthInput
        label="Professional Email"
        icon={EmailIcon}
        type="email"
        placeholder="alex@agency.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <AuthInput
        label="Access Credential"
        icon={PasswordIcon}
        type="password"
        placeholder="************"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-emerald-900/40 flex flex-col items-center justify-center relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                <span>Creating Workspace...</span>
              </div>
              <span className="text-[9px] uppercase tracking-tighter opacity-70 font-normal mt-0.5">
                Securing tenant identity...
              </span>
            </>
          ) : (
            <span>Create Workspace</span>
          )}
        </button>
      </div>
    </form>
  );
}
