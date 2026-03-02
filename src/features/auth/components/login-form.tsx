"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";
import { AuthInput } from "@/components/ui/auth-input";
import {
  WorkspaceDomainIcon,
  EmailIcon,
  PasswordIcon,
} from "@/components/icons";
import { login } from "../api/auth.api";
import { loginSchema, type LoginFormValues } from "../validations/auth.schema";
import { setAuthCookies } from "@/lib/cookies";
import { useAuthStore } from "../store/auth.store";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tenantId: "",
      email: "",
      password: "",
      persistSession: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await login(
        { email: data.email, password: data.password },
        data.tenantId,
      );

      setAuthCookies(
        response.access_token,
        response.refresh_token,
        data.tenantId,
        data.persistSession,
      );

      setAuth(response);

      toast.success("Authentication Successful", {
        description: `Welcome back, ${response.email}`,
      });

      const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
      router.push(callbackUrl);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg =
        err.response?.data?.message || "Invalid credentials or tenant ID.";
      toast.error("Authentication Failed", { description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-6">
        <AuthInput
          label="Workspace Domain / Tenant ID"
          icon={WorkspaceDomainIcon}
          placeholder="org-alias-01"
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
          placeholder="••••••••"
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

      <div className="space-y-4">
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

        <div className="relative py-2 flex items-center">
          <div className="grow border-t border-slate-900"></div>
          <span className="shrink mx-4 text-[10px] uppercase tracking-widest text-slate-700 font-bold">
            Or
          </span>
          <div className="grow border-t border-slate-900"></div>
        </div>

        <ConnectButton.Custom>
          {({ account, chain, openConnectModal, mounted }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                className={!ready ? "opacity-0" : "opacity-100"}
                aria-hidden={!ready}
              >
                {!connected ? (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="rainbow-border w-full h-14 rounded-lg text-white font-bold flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-sm relative group"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 12V15C21 16.1046 20.1046 17 19 17H5C3.89543 17 3 16.1046 3 15V9C3 7.89543 3.89543 7 5 7H19C20.1046 7 21 7.89543 21 9V10"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 12C16 12.5523 16.4477 13 17 13H21V11H17C16.4477 11 16 11.4477 16 12Z"
                      />
                    </svg>
                    Connect Wallet
                  </button>
                ) : (
                  <div className="rainbow-border w-full h-14 rounded-lg flex items-center justify-between px-4 transition-all">
                    <div className="flex items-center gap-2">
                      {chain.hasIcon && chain.iconUrl && (
                        <div className="w-6 h-6 bg-black rounded-full overflow-hidden flex items-center justify-center">
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            className="w-6 h-6"
                          />
                        </div>
                      )}
                      <span className="text-sm font-medium text-slate-300">
                        {chain.name}
                      </span>
                    </div>
                    <span className="text-white font-bold">
                      {account.displayName}
                    </span>
                  </div>
                )}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </form>
  );
}
