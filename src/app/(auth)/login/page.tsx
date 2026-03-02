import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  // title: "Client Hub | Verified Entry",
  description: "Secure login to your workspace tenant.",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h3 className="text-3xl font-medium text-white tracking-tight">
          Verified Entry
        </h3>
        <p className="text-slate-400">Initialize your professional session</p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6 animate-pulse">
            <div className="h-12 rounded-lg bg-slate-800/60" />
            <div className="h-12 rounded-lg bg-slate-800/60" />
            <div className="h-12 rounded-lg bg-slate-800/60" />
            <div className="h-14 rounded-lg bg-emerald-900/40" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>

      <p className="text-center text-slate-600 text-sm mt-8">
        New to the hub?{" "}
        <Link
          href="/register"
          className="text-white hover:text-emerald-400 transition-colors font-medium underline underline-offset-4 decoration-emerald-500/40"
        >
          Register new organization
        </Link>
      </p>
    </div>
  );
}
