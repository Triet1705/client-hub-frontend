"use client";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { CertificatesView } from "@/features/certificates/components/CertificatesView";
import { User, Mail, Shield, Briefcase } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile & Portfolio</h1>
        <p className="text-foreground/60 mt-2">
          Manage your account details and view your verified Web3 work certificates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-1 border border-surface-2 rounded-xl">
            <div className="p-6 pb-4 border-b border-surface-2/50">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Account Details
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-foreground/50 flex items-center gap-1.5"><User className="h-3 w-3"/> Full Name</p>
                <p className="font-medium text-foreground">{user?.fullName || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-foreground/50 flex items-center gap-1.5"><Mail className="h-3 w-3"/> Email</p>
                <p className="font-medium text-foreground">{user?.email || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-foreground/50 flex items-center gap-1.5"><Shield className="h-3 w-3"/> Role</p>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary uppercase tracking-wide">
                  {user?.role || "USER"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Verified Work Certificates
            </h2>
          </div>
          <CertificatesView />
        </div>
      </div>
    </div>
  );
}
