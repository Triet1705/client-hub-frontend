import * as React from "react";
import {
  useAdminUserDetailQuery,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useImpersonateMutation,
} from "../hooks/use-admin";
import type { Role } from "@/features/auth/types/auth.types";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { format } from "date-fns";
import { createPortal } from "react-dom";
import { getAuthToken } from "@/lib/cookies";
import { CloseIcon, EyesImpersonateIcon } from "@/components/icons";
import { SelectDropdown, type SelectOption } from "@/components/ui/select-dropdown";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const ROLE_OPTIONS: SelectOption[] = [
  { value: "CLIENT", label: "Client" },
  { value: "FREELANCER", label: "Freelancer" },
  { value: "ADMIN", label: "Platform Admin" },
];

interface SlideoverProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailSlideover({ userId, isOpen, onClose }: SlideoverProps) {
  const { data: user, isLoading } = useAdminUserDetailQuery(userId);
  const statusMutation = useUpdateUserStatusMutation();
  const roleMutation = useUpdateUserRoleMutation();
  const impersonateMutation = useImpersonateMutation();
  
  const { setImpersonation, user: adminUser } = useAuthStore();

  const [isMounted, setIsMounted] = React.useState(false);
  const [confirmConfig, setConfirmConfig] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    isDestructive?: boolean;
    confirmText?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: () => {},
  });

  React.useEffect(() => {
    setIsMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !isMounted) return null;

  const handleToggleStatus = () => {
    if (!user) return;
    setConfirmConfig({
      isOpen: true,
      title: user.active ? "Deactivate User" : "Activate User",
      message: user.active 
        ? `Are you sure you want to deactivate ${user.email}? They will no longer be able to log in.`
        : `Are you sure you want to activate ${user.email}? They will regain access to the platform.`,
      confirmText: user.active ? "Deactivate" : "Activate",
      isDestructive: user.active,
      action: () => {
        statusMutation.mutate(
          { id: user.id, active: !user.active },
          { onSuccess: () => setConfirmConfig(prev => ({ ...prev, isOpen: false })) }
        );
      }
    });
  };



  const handleImpersonate = () => {
    if (!user) return;
    setConfirmConfig({
      isOpen: true,
      title: "Impersonate User",
      message: `Are you sure you want to impersonate ${user.email}? Every action you take will be logged on behalf of this user.`,
      confirmText: "Impersonate",
      isDestructive: false,
      action: () => {
        impersonateMutation.mutate(user.id, {
          onSuccess: (res) => {
            const currentAdminToken = getAuthToken() || "";
            setImpersonation(res.accessToken, currentAdminToken, {
              id: res.id,
              email: res.email,
              role: res.role,
              tenantId: res.tenantId,
            });
            window.location.href = "/dashboard";
          },
          onError: (err) => {
            alert("Failed to impersonate: " + err.message);
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          }
        });
      }
    });
  };

  const canImpersonate = user?.role !== "ADMIN" && adminUser?.id !== user?.id;

  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0f172a] shadow-2xl z-50 flex flex-col border-l border-slate-800 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#1e293b]">
          <h2 className="text-xl font-bold text-white tracking-wide">User Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <CloseIcon className="h-5 w-5" primaryColor="currentColor" accentColor="currentColor" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
            </div>
          ) : user ? (
            <>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-white shadow-inner">
                  {(user.fullName || user.email).substring(0, 2).toUpperCase()}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">{user.fullName || "—"}</h3>
                  <p className="text-slate-400">{user.email}</p>
                </div>
                
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-slate-800 text-slate-300 uppercase">
                    {user.role}
                  </span>
                  {user.active ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-emerald-500/10 text-emerald-400 uppercase">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-red-500/10 text-red-400 uppercase">
                      INACTIVE
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2">Information</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">ID</p>
                    <p className="text-sm text-white font-mono break-all">{user.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Tenant ID</p>
                    <p className="text-sm text-white font-mono">{user.tenantId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Registered</p>
                    <p className="text-sm text-white">{format(new Date(user.createdAt), "MMM d, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Last Login</p>
                    <p className="text-sm text-white">{user.lastLoginAt ? format(new Date(user.lastLoginAt), "MMM d, yyyy HH:mm") : "Never"}</p>
                  </div>
                  {user.walletAddress && (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500 mb-1">Wallet Address</p>
                      <p className="text-sm text-white font-mono bg-slate-800/50 p-2 rounded">{user.walletAddress}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-white mb-1">{user.projectCount}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Projects</p>
                </div>
                <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-white mb-1">{user.invoiceCount}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Invoices</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2">Admin Controls</h4>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-slate-300">Account Status</label>
                    <button
                      onClick={handleToggleStatus}
                      disabled={statusMutation.isPending || user.role === "ADMIN"}
                      className={`py-2 px-4 rounded-lg font-medium text-sm transition-colors flex justify-center ${
                        user.active 
                          ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20" 
                          : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20"
                      } disabled:opacity-50`}
                    >
                      {statusMutation.isPending ? "Updating..." : user.active ? "Deactivate User" : "Activate User"}
                    </button>
                    {user.role === "ADMIN" && (
                      <p className="text-xs text-amber-500">Cannot deactivate another admin.</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-slate-300">Role</label>
                    <SelectDropdown
                      options={ROLE_OPTIONS}
                      value={user.role}
                      onChange={(v) => {
                        if (!user) return;
                        roleMutation.mutate({ id: user.id, role: v as Role });
                      }}
                      disabled={roleMutation.isPending || user.role === "ADMIN"}
                    />
                    {user.role === "ADMIN" && (
                      <p className="text-xs text-amber-500">Cannot change role of another admin.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-500">Failed to load user.</div>
          )}
        </div>

        {user && canImpersonate && (
          <div className="p-6 border-t border-slate-800 bg-[#1e293b]">
            <button
              onClick={handleImpersonate}
              disabled={impersonateMutation.isPending}
              className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {impersonateMutation.isPending ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <EyesImpersonateIcon className="h-5 w-5" primaryColor="currentColor" accentColor="currentColor" />
              )}
              Impersonate User
            </button>
            <p className="text-xs text-center text-slate-500 mt-3">
              You will act on behalf of this user. Every action will be logged.
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        isDestructive={confirmConfig.isDestructive}
        isLoading={statusMutation.isPending || impersonateMutation.isPending}
        onConfirm={confirmConfig.action}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </>,
    document.body
  );
}
