"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";

import { AuthInput } from "@/components/ui/auth-input";
import {
  WorkspaceDomainIcon,
  EmailIcon,
  PasswordIcon,
  PersonIcon,
} from "@/components/icons";
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
      const response = await registerUser(
        {
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          role: data.role,
        },
        data.tenantId,
      );

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
            <span className="text-lg">💼</span>
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
            <span className="text-lg">🏢</span>
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
        placeholder="••••••••••••"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="pt-4 space-y-4">
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
                    Connect Wallet to Verify
                  </button>
                ) : (
                  <div className="rainbow-border w-full h-14 rounded-lg flex items-center justify-between px-4 transition-all">
                    <div className="flex items-center gap-2">
                      {chain.hasIcon && chain.iconUrl && (
                        <div className="w-5 h-5 bg-black rounded-full overflow-hidden flex items-center justify-center">
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            className="w-5 h-5"
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
