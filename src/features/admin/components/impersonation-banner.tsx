"use client";

import * as React from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useRouter } from "next/navigation";
import { EyesImpersonateIcon } from "@/components/icons";

export function ImpersonationBanner() {
  const { isImpersonating, user, exitImpersonation } = useAuthStore();
  const [isMounted, setIsMounted] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isImpersonating) return null;

  const handleExit = () => {
    exitImpersonation();
    router.push("/admin/users");
  };

  return (
    <div className="w-full bg-emerald-600 text-white px-4 py-2 flex items-center justify-between shadow-md z-[100] relative">
      <div className="flex items-center gap-2 text-sm font-medium">
        <EyesImpersonateIcon className="h-5 w-5" primaryColor="#ffffff" accentColor="#10b981" />
        <span>Viewing as {user?.email} [{user?.role}]</span>
      </div>
      <button
        onClick={handleExit}
        className="text-xs bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded font-bold uppercase tracking-wider transition-colors"
      >
        Exit Impersonation
      </button>
    </div>
  );
}
