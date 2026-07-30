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
        className="fixed inset-0 z-40 animate-in bg-[var(--overlay)] backdrop-blur-sm fade-in duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-surface shadow-2xl z-50 flex flex-col border-l border-theme-border animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-theme-border bg-surface-elevated">
          <h2 className="text-xl font-bold text-content-primary tracking-wide">User Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-elevated transition-colors"
          >
            <CloseIcon className="h-5 w-5" primaryColor="currentColor" accentColor="currentColor" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 rounded-full border-4 border-theme-accent border-t-transparent animate-spin" />
            </div>
          ) : user ? (
            <>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="h-20 w-20 rounded-full bg-surface-elevated flex items-center justify-center text-2xl font-bold text-content-primary shadow-inner">
                  {(user.fullName || user.email).substring(0, 2).toUpperCase()}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-content-primary">{user.fullName || "—"}</h3>
                  <p className="text-content-secondary">{user.email}</p>
                </div>

                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-surface-elevated text-content-secondary uppercase">
                    {user.role}
                  </span>
                  {user.active ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-action-subtle text-theme-accent uppercase">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-status-danger-surface text-status-danger-text uppercase">
                      INACTIVE
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-content-muted uppercase tracking-wider border-b border-theme-border pb-2">Information</h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-content-muted mb-1">ID</p>
                    <p className="text-sm text-content-primary font-mono break-all">{user.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-content-muted mb-1">Tenant ID</p>
                    <p className="text-sm text-content-primary font-mono">{user.tenantId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-content-muted mb-1">Registered</p>
                    <p className="text-sm text-content-primary">{format(new Date(user.createdAt), "MMM d, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-content-muted mb-1">Last Login</p>
                    <p className="text-sm text-content-primary">{user.lastLoginAt ? format(new Date(user.lastLoginAt), "MMM d, yyyy HH:mm") : "Never"}</p>
                  </div>
                  {user.walletAddress && (
                    <div className="col-span-2">
                      <p className="text-xs text-content-muted mb-1">Wallet Address</p>
                      <p className="text-sm text-content-primary font-mono bg-surface-elevated/50 p-2 rounded">{user.walletAddress}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="bg-surface-elevated border border-theme-border rounded-xl p-4 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-content-primary mb-1">{user.projectCount}</p>
                  <p className="text-xs text-content-secondary uppercase tracking-wider">Projects</p>
                </div>
                <div className="bg-surface-elevated border border-theme-border rounded-xl p-4 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-content-primary mb-1">{user.invoiceCount}</p>
                  <p className="text-xs text-content-secondary uppercase tracking-wider">Invoices</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-content-muted uppercase tracking-wider border-b border-theme-border pb-2">Admin Controls</h4>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-content-secondary">Account Status</label>
                    <button
                      onClick={handleToggleStatus}
                      disabled={statusMutation.isPending || user.role === "ADMIN"}
                      className={`py-2 px-4 rounded-lg font-medium text-sm transition-colors flex justify-center ${
                        user.active
                          ? "bg-status-danger-surface text-status-danger-text hover:bg-status-danger-surface border border-status-danger-border"
                          : "bg-action-subtle text-theme-accent hover:bg-action-subtle border border-theme-accent"
                      } disabled:opacity-50`}
                    >
                      {statusMutation.isPending ? "Updating..." : user.active ? "Deactivate User" : "Activate User"}
                    </button>
                    {user.role === "ADMIN" && (
                      <p className="text-xs text-status-warning-text">Cannot deactivate another admin.</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-content-secondary">Role</label>
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
                      <p className="text-xs text-status-warning-text">Cannot change role of another admin.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-content-muted">Failed to load user.</div>
          )}
        </div>

        {user && canImpersonate && (
          <div className="p-6 border-t border-theme-border bg-surface-elevated">
            <button
              onClick={handleImpersonate}
              disabled={impersonateMutation.isPending}
              className="w-full py-3 rounded-lg bg-action-primary hover:bg-action-primary-hover text-action-primary-foreground font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {impersonateMutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-action-danger-foreground border-t-transparent" />
              ) : (
                <EyesImpersonateIcon className="h-5 w-5" primaryColor="currentColor" accentColor="currentColor" />
              )}
              Impersonate User
            </button>
            <p className="text-xs text-center text-content-muted mt-3">
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
