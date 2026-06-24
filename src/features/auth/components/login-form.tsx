"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthInput } from "@/components/ui/auth-input";
import {
  EmailIcon,
  PasswordIcon,
  WorkspaceDomainIcon,
} from "@/components/icons";
import { login } from "../api/auth.api";
import { loginSchema, type LoginFormValues, type LoginInputValues } from "../validations/auth.schema";
import { getTenantId, setAuthCookies } from "@/lib/cookies";
import { useAuthStore } from "../store/auth.store";

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInputValues, unknown, LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tenantId: getTenantId() || "",
      email: "",
      password: "",
      persistSession: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    const passwordLooksQuoted =
      data.password.length >= 2 &&
      ((data.password.startsWith("'") && data.password.endsWith("'")) ||
        (data.password.startsWith('"') && data.password.endsWith('"')));

    if (passwordLooksQuoted) {
      setError("password", {
        type: "manual",
        message: "Password appears to include copied quote characters. Remove leading/trailing quotes and try again.",
      });
      toast.error("Invalid password format", {
        description: "Please remove copied quote characters around your password.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const tenantId = data.tenantId.trim().toLowerCase();
      const response = await login(
        { email: data.email, password: data.password },
        tenantId,
      );

      setAuthCookies(
        response.access_token,
        response.refresh_token,
        response.tenant_id,
        data.persistSession,
      );

      setAuth(response);

      toast.success("Authentication Successful", {
        description: `Welcome back, ${response.email}`,
      });

      const defaultPath = response.role === "ADMIN" ? "/admin" : "/dashboard";
      const callbackUrl = searchParams.get("callbackUrl") ?? defaultPath;
      router.push(callbackUrl);
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      const errorMsg =
        err.response?.data?.message || "Invalid credentials or tenant ID.";

      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("password", {
          type: "manual",
          message: "Incorrect email or password. Check copied characters and try again.",
        });
      }

      toast.error("Authentication Failed", { description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-6">
        <AuthInput
          label="Workspace Name / Tenant ID"
          icon={WorkspaceDomainIcon}
          placeholder="agency-alpha-hq"
          error={errors.tenantId?.message}
          {...register("tenantId")}
        />

        <AuthInput
          label="Email Identity"
          icon={EmailIcon}
          type="email"
          placeholder="name@company.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <AuthInput
          label="Access Credential"
          icon={PasswordIcon}
          type="password"
          placeholder="********"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            className="rounded-sm bg-slate-900 border-slate-800 text-emerald-600 focus:ring-emerald-600 focus:ring-offset-[#020617]"
            {...register("persistSession")}
          />
          <span className="text-slate-500 group-hover:text-slate-300 transition-colors">
            Persist session
          </span>
        </label>
        <Link
          href="/recovery"
          className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
        >
          Recovery
        </Link>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-emerald-900/40 flex flex-col items-center justify-center relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full border-2 border-white/25 border-t-white animate-spin" />
              <span>Processing...</span>
            </div>
            <span className="text-[9px] uppercase tracking-tighter opacity-70 font-normal mt-0.5">
              Validating tenant logic...
            </span>
          </>
        ) : (
          <span>Sign In Securely</span>
        )}
      </button>
    </form>
  );
}
