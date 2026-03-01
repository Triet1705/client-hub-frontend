import { RegisterForm } from "@/features/auth/components/register-form";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Hub | Register Organization",
  description: "Provision your secure workspace tenant.",
};

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md space-y-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h3 className="text-3xl font-medium text-white tracking-tight">
          Register Organization
        </h3>
        <p className="text-slate-400">Provision your secure workspace tenant</p>
      </div>

      <RegisterForm />

      <p className="text-center text-slate-600 text-sm mt-8">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-white hover:text-emerald-400 transition-colors font-medium underline underline-offset-4 decoration-emerald-500/40"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
