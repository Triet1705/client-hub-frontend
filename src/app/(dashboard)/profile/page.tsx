"use client";

import Link from "next/link";
import type { ElementType } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  ExternalLink,
  Mail,
  MessageSquareReply,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { CertificatesView } from "@/features/certificates/components/CertificatesView";
import { useCurrentUserQuery } from "@/features/users/hooks/use-current-user";
import type { CurrentUser } from "@/features/users/api/user.api";
import { ProfileSkeleton } from "@/components/skeletons/page-skeletons";
import { UserAvatar } from "@/components/ui/user-avatar";
import { apiClient } from "@/lib/axios";
import { cn } from "@/lib/utils";

interface TrustScoreResponse {
  trustScore: number;
  paidInvoices: number;
  totalInvoices: number;
}

interface ResponseRateResponse {
  responseRate: number;
  respondedThreads: number;
  totalThreads: number;
}

async function fetchTrustScore(): Promise<TrustScoreResponse> {
  const { data } = await apiClient.get<TrustScoreResponse>("/analytics/trust-score");
  return data;
}

async function fetchResponseRate(): Promise<ResponseRateResponse> {
  const { data } = await apiClient.get<ResponseRateResponse>("/analytics/active-response-rate");
  return data;
}

function TrustRing({ value, isLoading }: { value: number; isLoading?: boolean }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.max(0, Math.min(100, value));
  const offset = circumference - (normalized / 100) * circumference;

  return (
    <div className="relative flex size-40 items-center justify-center">
      <svg className="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} fill="transparent" stroke="currentColor" strokeWidth="6" className="text-slate-800" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={isLoading ? circumference * 0.35 : offset}
          className="text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-4xl font-bold tracking-tight text-white">{isLoading ? "--" : normalized}</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Trust score</p>
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  helper,
  icon: Icon,
  tone = "emerald",
}: {
  label: string;
  value: string;
  helper: string;
  icon: ElementType;
  tone?: "emerald" | "amber" | "slate";
}) {
  const toneClass = {
    emerald: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 ring-amber-500/20",
    slate: "text-slate-300 bg-slate-500/10 ring-slate-500/20",
  }[tone];

  return (
    <div className="rounded-3xl bg-surface-elevated/70 p-5 ring-1 ring-theme-border">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-content-muted">{label}</p>
        <span className={cn("rounded-2xl p-2 ring-1", toneClass)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="text-3xl font-bold tracking-tight text-content-primary">{value}</p>
      <p className="mt-2 text-sm text-content-muted">{helper}</p>
    </div>
  );
}

function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-theme-border bg-surface-base/40 p-8 text-center">
      <p className="font-semibold text-content-primary">{title}</p>
      <p className="mt-2 text-sm leading-6 text-content-muted">{description}</p>
    </div>
  );
}

function ClientProfile({ 
  me, 
  trust, 
  responseRate, 
  trustLoading, 
  responseLoading 
}: { 
  me: CurrentUser, 
  trust: TrustScoreResponse | undefined, 
  responseRate: ResponseRateResponse | undefined, 
  trustLoading: boolean, 
  responseLoading: boolean 
}) {
  const trustScore = trust?.trustScore ?? 0;
  const responseScore = responseRate?.responseRate ?? 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-3xl bg-surface-elevated/70 p-8 ring-1 ring-theme-border">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <UserAvatar name={me.fullName || me.email} sizeClass="h-16 w-16 text-lg" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Client identity</p>
              <h1 className="mt-2 text-3xl font-bold text-content-primary">{me.fullName || me.email}</h1>
              <p className="mt-2 max-w-2xl text-content-secondary">
                {me.profile.headline || "Add a client headline in settings so collaborators understand your project context."}
              </p>
            </div>
          </div>
          <Link href="/settings" className="rounded-xl border border-theme-border px-4 py-2 text-sm font-semibold text-content-primary hover:bg-surface-elevated">
            Edit Settings
          </Link>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricTile label="Role" value="Client" helper={`Tenant ${me.tenantId}`} icon={BriefcaseBusiness} tone="slate" />
        <MetricTile label="Wallet" value={me.walletAddress ? "Configured" : "Missing"} helper={me.walletAddress ? "Wallet saved for Web3 workflows." : "Bind wallet in settings."} icon={WalletCards} tone={me.walletAddress ? "emerald" : "amber"} />
        <MetricTile label="Visibility" value={me.profile.publicProfile ? "Public" : "Private"} helper="Controlled from profile settings." icon={ShieldCheck} tone="slate" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <MetricTile
          label="Trust Score"
          value={trustLoading ? "..." : `${trustScore}%`}
          helper={`${trust?.paidInvoices ?? 0} paid of ${trust?.totalInvoices ?? 0} invoices`}
          icon={ShieldCheck}
        />
        <MetricTile
          label="Response Rate"
          value={responseLoading ? "..." : `${responseScore}%`}
          helper={`${responseRate?.respondedThreads ?? 0} of ${responseRate?.totalThreads ?? 0} threads responded`}
          icon={MessageSquareReply}
        />
      </div>
      <section className="rounded-3xl bg-surface-elevated/70 p-6 ring-1 ring-theme-border">
        <h2 className="text-lg font-semibold text-content-primary">Collaboration Profile</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-content-secondary">
          {me.profile.bio || "Add a short client profile in settings so freelancers can understand how you collaborate and what kind of projects you run."}
        </p>
      </section>
    </div>
  );
}

function AdminProfile({ me }: { me: CurrentUser }) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-surface-elevated/80 p-8 shadow-2xl shadow-black/20 ring-1 ring-theme-border">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex items-start gap-5">
          <UserAvatar name={me.fullName || me.email} sizeClass="h-20 w-20 text-xl" />
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">System Administrator</p>
            <h1 className="mt-2 text-3xl font-bold text-white">{me.fullName || me.email}</h1>
            <p className="mt-2 text-content-muted">Admin account configured for system oversight and management.</p>
            
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/admin/settings" className="inline-flex rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors">
                Open Admin Portal
              </Link>
              <Link href="/dashboard" className="inline-flex rounded-xl border border-theme-border bg-surface-base px-5 py-2.5 text-sm font-semibold text-content-primary hover:bg-surface-elevated transition-colors">
                View User Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <div className="grid gap-4 md:grid-cols-2">
        <MetricTile label="System Access" value="Full" helper="Unrestricted workspace access" icon={ShieldCheck} tone="emerald" />
        <MetricTile label="Security" value="Active" helper="Admin privileges verified" icon={BadgeCheck} tone="emerald" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: me, isLoading } = useCurrentUserQuery();
  const { data: trust, isLoading: trustLoading } = useQuery({
    queryKey: ["profile", "trust-score"],
    queryFn: fetchTrustScore,
    enabled: !!me && me.role !== "ADMIN",
  });
  const { data: responseRate, isLoading: responseLoading } = useQuery({
    queryKey: ["profile", "response-rate"],
    queryFn: fetchResponseRate,
    enabled: !!me && me.role !== "ADMIN",
  });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!me) {
    return (
      <div className="rounded-3xl border border-theme-border bg-surface-elevated/60 p-8 text-content-secondary">
        Profile data is unavailable.
      </div>
    );
  }

  if (me.role === "ADMIN") {
    return <AdminProfile me={me} />;
  }

  if (me.role === "CLIENT") {
    return <ClientProfile me={me} trust={trust} responseRate={responseRate} trustLoading={trustLoading} responseLoading={responseLoading} />;
  }

  const skills = me.profile.skills.length > 0 ? me.profile.skills : [];
  const displayName = me.fullName || me.email;
  const walletLabel = me.walletAddress ? `${me.walletAddress.slice(0, 6)}...${me.walletAddress.slice(-4)}` : "Wallet not configured";
  const trustScore = trust?.trustScore ?? 0;
  const responseScore = responseRate?.responseRate ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="relative overflow-hidden rounded-3xl bg-surface-elevated/80 p-8 shadow-2xl shadow-black/20 ring-1 ring-theme-border lg:col-span-8">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-8 md:flex-row">
            <div className="relative shrink-0">
              <div className="flex h-36 w-36 items-center justify-center rounded-3xl border border-theme-border bg-surface-base/70 shadow-xl shadow-black/20 md:h-40 md:w-40">
                <UserAvatar name={displayName} sizeClass="h-28 w-28 text-3xl" />
              </div>
              <span className="absolute -bottom-2 -right-2 rounded-full bg-emerald-500 p-2 text-white shadow-lg shadow-emerald-500/30">
                <BadgeCheck className="h-5 w-5" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                  Public Portfolio
                </span>
                <span className="rounded-full border border-theme-border bg-surface-base/70 px-3 py-1 font-mono text-[10px] text-content-muted">
                  {walletLabel}
                </span>
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">{displayName}</h1>
              <p className="mt-2 text-lg font-semibold text-emerald-300">
                {me.profile.headline || "Freelancer profile headline not configured"}
              </p>
              <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-7 text-content-secondary">
                {me.profile.bio || "Add a short bio in settings so clients can understand your focus, working style, and delivery strengths."}
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-content-muted">
                <span className="inline-flex items-center gap-2 rounded-full bg-surface-base/60 px-3 py-1.5 ring-1 ring-theme-border">
                  <Mail className="h-4 w-4" />
                  {me.profile.showEmail ? me.email : "Email private"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-surface-base/60 px-3 py-1.5 ring-1 ring-theme-border">
                  <WalletCards className="h-4 w-4" />
                  {me.walletAddress ? "Wallet configured" : "Wallet missing"}
                </span>
                {me.profile.portfolioUrl ? (
                  <Link href={me.profile.portfolioUrl} target="_blank" className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-emerald-300 ring-1 ring-emerald-500/20 hover:text-emerald-200">
                    Portfolio <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col items-center justify-center rounded-3xl bg-surface-elevated/80 p-6 text-center shadow-2xl shadow-black/20 ring-1 ring-theme-border lg:col-span-4">
          <p className="mb-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-content-muted">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Integrity Score
          </p>
          <TrustRing value={trustScore} isLoading={trustLoading} />
          <div className="mt-6 flex flex-col items-center gap-2">
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
              {trust?.paidInvoices ?? 0}/{trust?.totalInvoices ?? 0} paid invoices
            </span>
            <span className="rounded-full border border-theme-border bg-surface-base/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-content-muted">
              {me.profile.publicProfile ? "Public profile enabled" : "Private profile"}
            </span>
          </div>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricTile
          label="Trust Score"
          value={trustLoading ? "..." : `${trustScore}%`}
          helper={`${trust?.paidInvoices ?? 0} paid of ${trust?.totalInvoices ?? 0} invoices`}
          icon={ShieldCheck}
        />
        <MetricTile
          label="Response Rate"
          value={responseLoading ? "..." : `${responseScore}%`}
          helper={`${responseRate?.respondedThreads ?? 0} of ${responseRate?.totalThreads ?? 0} threads responded`}
          icon={MessageSquareReply}
        />
        <MetricTile
          label="Certificates"
          value="SBT Ready"
          helper="Verified work records appear below."
          icon={Award}
          tone="slate"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
        <section className="rounded-3xl bg-surface-elevated/80 p-6 ring-1 ring-theme-border">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-content-primary">
              <BadgeCheck className="h-5 w-5 text-emerald-400" />
              Skills & Expertise
            </h2>
            <span className="rounded-full bg-surface-base/60 px-2 py-1 font-mono text-[9px] uppercase text-content-muted ring-1 ring-theme-border">
              Profile skills
            </span>
          </div>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 font-mono text-xs font-semibold text-emerald-300">
                  {skill}
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
              ))}
            </div>
          ) : (
            <EmptyPanel title="No skills configured" description="Add skills in Settings so this profile can read like a professional portfolio." />
          )}
          <div className="mt-6 border-t border-theme-border/70 pt-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Visibility</p>
            <p className="mt-2 text-sm text-content-secondary">
              {me.profile.publicProfile ? "This profile is marked public in your preferences." : "This profile is currently private. Enable public profile in Settings when ready."}
            </p>
          </div>
        </section>

        <section className="rounded-3xl bg-surface-elevated/80 p-6 ring-1 ring-theme-border">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-content-primary">
              <Award className="h-5 w-5 text-emerald-400" />
              Verified Work Certificates
            </h2>
            <Link href="/settings" className="rounded-xl border border-theme-border px-3 py-2 text-sm font-semibold text-content-primary hover:bg-surface-elevated">
              Edit Portfolio
            </Link>
          </div>
          <CertificatesView />
        </section>
      </div>
    </div>
  );
}
