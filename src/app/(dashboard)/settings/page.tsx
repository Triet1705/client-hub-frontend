"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { Bell, KeyRound, MonitorCog, Palette, Shield, User, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/user-avatar";
import { SettingsSkeleton } from "@/components/skeletons/page-skeletons";
import { bindWalletAddress } from "@/features/users/api/user.api";
import {
  useChangePasswordMutation,
  useCurrentUserQuery,
  useUpdatePreferencesMutation,
  useUpdateProfileMutation,
} from "@/features/users/hooks/use-current-user";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "profile", label: "Account", icon: User, helper: "Identity and portfolio" },
  { id: "notifications", label: "Notifications", icon: Bell, helper: "Categories and quiet hours" },
  { id: "display", label: "Display", icon: Palette, helper: "Theme, currency, dates" },
  { id: "security", label: "Security", icon: Shield, helper: "Password controls" },
  { id: "wallet", label: "Wallet", icon: WalletCards, helper: "Connected wallet state" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function SettingsPanel({
  id,
  title,
  description,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-3xl border border-theme-border bg-surface-elevated/70 p-6 shadow-2xl shadow-black/10">
      <div className="mb-6 flex items-start gap-3">
        <span className="rounded-2xl bg-emerald-500/10 p-2.5 text-emerald-400 ring-1 ring-emerald-500/20">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-content-primary">{title}</h2>
          <p className="mt-1 text-sm text-content-muted">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-theme-border bg-surface-base/50 p-4 transition-colors hover:bg-surface-elevated/50">
      <span>
        <span className="block text-sm font-medium text-content-primary">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-content-muted">{description}</span>
      </span>
      <div className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 focus-within:ring-offset-surface-base" style={{ backgroundColor: checked ? "#10b981" : "#334155" }}>
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", checked ? "translate-x-6" : "translate-x-1")} />
      </div>
    </label>
  );
}

export default function SettingsPage() {
  const { data: me, isLoading } = useCurrentUserQuery();
  const updateProfile = useUpdateProfileMutation();
  const updatePreferences = useUpdatePreferencesMutation();
  const changePassword = useChangePasswordMutation();
  const { address, isConnected } = useAccount();

  const [activeSection, setActiveSection] = React.useState<SectionId>("profile");
  const [profile, setProfile] = React.useState({
    fullName: "",
    headline: "",
    bio: "",
    skills: "",
    portfolioUrl: "",
    publicProfile: false,
    showEmail: false,
    showWallet: false,
  });
  const [preferences, setPreferences] = React.useState({
    theme: "dark" as "dark" | "light",
    currency: "USD",
    dateFormat: "DD/MM/YYYY" as "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD",
    timezone: "UTC",
    notifyComments: true,
    notifyTasks: true,
    notifyProjects: true,
    notifyInvoices: true,
    quietHoursEnabled: false,
    quietHoursStart: "18:00",
    quietHoursEnd: "08:00",
  });
  const [password, setPassword] = React.useState({ currentPassword: "", newPassword: "" });
  const [walletSaving, setWalletSaving] = React.useState(false);

  React.useEffect(() => {
    if (!me) return;
    setProfile({
      fullName: me.fullName ?? "",
      headline: me.profile.headline ?? "",
      bio: me.profile.bio ?? "",
      skills: me.profile.skills.join(", "),
      portfolioUrl: me.profile.portfolioUrl ?? "",
      publicProfile: me.profile.publicProfile,
      showEmail: me.profile.showEmail,
      showWallet: me.profile.showWallet,
    });
    setPreferences({
      theme: me.preferences.theme,
      currency: me.preferences.currency,
      dateFormat: me.preferences.dateFormat,
      timezone: me.preferences.timezone,
      notifyComments: me.preferences.notifyComments,
      notifyTasks: me.preferences.notifyTasks,
      notifyProjects: me.preferences.notifyProjects,
      notifyInvoices: me.preferences.notifyInvoices,
      quietHoursEnabled: me.preferences.quietHoursEnabled,
      quietHoursStart: me.preferences.quietHoursStart ?? "18:00",
      quietHoursEnd: me.preferences.quietHoursEnd ?? "08:00",
    });
  }, [me]);

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  const saveWallet = async () => {
    if (!address) return;
    setWalletSaving(true);
    try {
      await bindWalletAddress(address);
      toast.success("Wallet bound successfully");
    } catch {
      toast.error("Failed to bind wallet");
    } finally {
      setWalletSaving(false);
    }
  };

  const scrollToSection = (section: SectionId) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
            <MonitorCog className="h-3.5 w-3.5" />
            Workspace preferences
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-content-primary">Settings</h1>
          <p className="mt-2 max-w-2xl text-content-muted">Manage account identity, notification boundaries, display defaults, security, and wallet connection.</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-surface-elevated/70 p-3 ring-1 ring-theme-border">
          <UserAvatar name={profile.fullName || me?.email || "User"} sizeClass="h-10 w-10 text-sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-content-primary">{me?.email}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">{me?.role}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <div className="flex gap-2 overflow-x-auto rounded-3xl bg-surface-elevated/70 p-2 ring-1 ring-theme-border xl:block xl:space-y-2">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "flex min-w-44 items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors xl:w-full xl:min-w-0",
                    isActive ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20" : "text-content-muted hover:bg-surface-base/60 hover:text-content-primary",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{section.label}</span>
                    <span className="block truncate text-xs opacity-70">{section.helper}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-6">
          <SettingsPanel id="profile" title="Account Profile" description="Public identity, portfolio content, and privacy flags." icon={User}>
            <div className="grid gap-4 lg:grid-cols-2">
              <FormField label="Full name"><Input value={profile.fullName} onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))} /></FormField>
              <FormField label="Headline"><Input value={profile.headline} onChange={(e) => setProfile((p) => ({ ...p, headline: e.target.value }))} /></FormField>
              <FormField label="Bio" className="lg:col-span-2"><Textarea rows={5} value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} /></FormField>
              <FormField label="Skills"><Input value={profile.skills} onChange={(e) => setProfile((p) => ({ ...p, skills: e.target.value }))} placeholder="React, Spring Boot, Web3" /></FormField>
              <FormField label="Portfolio URL"><Input value={profile.portfolioUrl} onChange={(e) => setProfile((p) => ({ ...p, portfolioUrl: e.target.value }))} /></FormField>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <ToggleRow label="Public profile" description="Allow profile surfaces to present your identity." checked={profile.publicProfile} onChange={(checked) => setProfile((p) => ({ ...p, publicProfile: checked }))} />
              <ToggleRow label="Show email" description="Display email on profile when public." checked={profile.showEmail} onChange={(checked) => setProfile((p) => ({ ...p, showEmail: checked }))} />
              <ToggleRow label="Show wallet" description="Display wallet status on profile." checked={profile.showWallet} onChange={(checked) => setProfile((p) => ({ ...p, showWallet: checked }))} />
            </div>
            <Button
              className="mt-5"
              isLoading={updateProfile.isPending}
              onClick={() => updateProfile.mutate({
                ...profile,
                skills: profile.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
              }, {
                onSuccess: () => toast.success("Profile updated successfully"),
                onError: () => toast.error("Failed to update profile")
              })}
            >
              Save Profile
            </Button>
          </SettingsPanel>

          <SettingsPanel id="notifications" title="Notifications" description="Control which operational updates create in-app notifications." icon={Bell}>
            <div className="grid gap-3 md:grid-cols-2">
              <ToggleRow label="Comments" description="New comments and mentions." checked={preferences.notifyComments} onChange={(checked) => setPreferences((p) => ({ ...p, notifyComments: checked }))} />
              <ToggleRow label="Tasks" description="Task assignment and completion." checked={preferences.notifyTasks} onChange={(checked) => setPreferences((p) => ({ ...p, notifyTasks: checked }))} />
              <ToggleRow label="Projects" description="Project invites and completions." checked={preferences.notifyProjects} onChange={(checked) => setPreferences((p) => ({ ...p, notifyProjects: checked }))} />
              <ToggleRow label="Invoices" description="Invoice payment and status changes." checked={preferences.notifyInvoices} onChange={(checked) => setPreferences((p) => ({ ...p, notifyInvoices: checked }))} />
            </div>
            <div className="mt-5 rounded-2xl border border-theme-border bg-surface-base/50 p-4">
              <ToggleRow label="Quiet hours" description="Keep notifications stored but reduce interruption windows." checked={preferences.quietHoursEnabled} onChange={(checked) => setPreferences((p) => ({ ...p, quietHoursEnabled: checked }))} />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FormField label="Start"><Input type="time" value={preferences.quietHoursStart} onChange={(e) => setPreferences((p) => ({ ...p, quietHoursStart: e.target.value }))} /></FormField>
                <FormField label="End"><Input type="time" value={preferences.quietHoursEnd} onChange={(e) => setPreferences((p) => ({ ...p, quietHoursEnd: e.target.value }))} /></FormField>
              </div>
            </div>
            <Button className="mt-5" isLoading={updatePreferences.isPending} onClick={() => updatePreferences.mutate(preferences, { onSuccess: () => toast.success("Notifications updated successfully"), onError: () => toast.error("Failed to update notifications") })}>Save Notifications</Button>
          </SettingsPanel>

          <SettingsPanel id="display" title="Display" description="Persist defaults used across workspace pages." icon={Palette}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Theme">
                <CustomSelect
                  value={preferences.theme}
                  onChange={(val) => setPreferences((p) => ({ ...p, theme: val as "dark" | "light" }))}
                  options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]}
                />
              </FormField>
              <FormField label="Currency"><Input value={preferences.currency} onChange={(e) => setPreferences((p) => ({ ...p, currency: e.target.value.toUpperCase().slice(0, 3) }))} /></FormField>
              <FormField label="Date format">
                <CustomSelect
                  value={preferences.dateFormat}
                  onChange={(val) => setPreferences((p) => ({ ...p, dateFormat: val as typeof preferences.dateFormat }))}
                  options={[
                    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                  ]}
                />
              </FormField>
              <FormField label="Timezone"><Input value={preferences.timezone} onChange={(e) => setPreferences((p) => ({ ...p, timezone: e.target.value }))} /></FormField>
            </div>
            <Button className="mt-5" isLoading={updatePreferences.isPending} onClick={() => updatePreferences.mutate(preferences, { onSuccess: () => toast.success("Display settings updated successfully"), onError: () => toast.error("Failed to update display settings") })}>Save Display</Button>
          </SettingsPanel>

          <SettingsPanel id="security" title="Security" description="Update password without ending the current session." icon={Shield}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Current password"><Input type="password" value={password.currentPassword} onChange={(e) => setPassword((p) => ({ ...p, currentPassword: e.target.value }))} /></FormField>
              <FormField label="New password">
                <Input type="password" value={password.newPassword} onChange={(e) => setPassword((p) => ({ ...p, newPassword: e.target.value }))} />
                {password.newPassword && (
                  <div className="mt-2 flex h-1 w-full overflow-hidden rounded-full bg-surface-base">
                    <div 
                      className={cn("h-full transition-all duration-300", password.newPassword.length > 8 ? (password.newPassword.match(/[!@#$%^&*(),.?":{}|<>]/) && password.newPassword.match(/[A-Z]/) ? "w-full bg-emerald-500" : "w-2/3 bg-amber-500") : "w-1/3 bg-red-500")}
                    />
                  </div>
                )}
              </FormField>
            </div>
            <Button
              className="mt-5"
              variant="secondary"
              isLoading={changePassword.isPending}
              onClick={() => changePassword.mutate(password, { 
                onSuccess: () => {
                  setPassword({ currentPassword: "", newPassword: "" });
                  toast.success("Password changed successfully");
                },
                onError: () => toast.error("Failed to change password")
              })}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Change Password
            </Button>
          </SettingsPanel>

          <SettingsPanel id="wallet" title="Wallet" description="Bind a connected wallet for Web3 trust workflows." icon={WalletCards}>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-theme-border bg-surface-base/50 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-content-muted">Saved wallet</p>
                <p className="mt-3 break-all font-mono text-sm text-content-primary">{me?.walletAddress || "Not configured"}</p>
              </div>
              <div className="rounded-2xl border border-theme-border bg-surface-base/50 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-content-muted">Connected wallet</p>
                <p className="mt-3 break-all font-mono text-sm text-content-primary">{address || "Not connected"}</p>
              </div>
            </div>
            <Button className="mt-5" disabled={!isConnected || !address} isLoading={walletSaving} onClick={saveWallet}>
              Bind Connected Wallet
            </Button>
          </SettingsPanel>
        </div>
      </div>
    </div>
  );
}
