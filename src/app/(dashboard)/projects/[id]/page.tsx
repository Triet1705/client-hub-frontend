"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Activity as ActivityIcon,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock3,
  DollarSign,
  ExternalLink,
  FileText,
  Flag,
  FolderGit2,
  LayoutGrid,
  LayoutDashboard,
  List,
  ListTodo,
  MessageSquare,
  Paperclip,
  Plus,
  Receipt,
  SlidersHorizontal,
  Sparkles,
  TimerReset,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn, formatDate, formatFiat, formatInvoiceId } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { TaskPriority, TaskStatus, type Task } from "@/features/tasks/types/task.types";
import { TaskBoard } from "@/features/tasks/components/task-board";
import { TaskList } from "@/features/tasks/components/task-list";
import { CreateTaskModal } from "@/features/tasks/components/create-task-modal";
import { useTasksQuery } from "@/features/tasks/hooks/use-tasks";
import { TaskAdvancedFilters } from "@/features/tasks/components/task-advanced-filters";
import {
  DEFAULT_ADVANCED_FILTERS,
  isTaskMatchingAdvancedFilters,
  isTaskMatchingDueFilter,
  type AdvancedFilters,
} from "@/features/tasks/utils/task-filter";
import type { TaskDueFilterValue, TaskPriorityFilterValue, TaskStatusFilterValue, TasksViewMode } from "@/features/tasks/query/tasks-query.schema";
import { TASK_PRIORITY_OPTIONS } from "@/features/tasks/constants/task-ui.constants";
import { FilterDropdown, type FilterDropdownOption } from "@/components/ui/filter-dropdown";
import {
  useAddMemberMutation,
  useProjectActivityQuery,
  useProjectActivityProofQuery,
  useVerifyProjectActivityProofMutation,
  useProjectDetailQuery,
  useProjectFilesQuery,
  useProjectInvoicesQuery,
  useProjectMembersQuery,
  useProjectProgressQuery,
  useRemoveMemberMutation,
} from "@/features/projects/hooks/use-projects";
import type { ProjectActivityItem, ProjectFileItem, ProjectInvoice } from "@/features/projects/types/project.types";
import { ProjectStatusBadge } from "@/features/projects/components/project-status-badge";
import { ProjectFileUploadZone } from "@/features/projects/components/project-file-upload-zone";
import { TaskDetailSlideover } from "@/features/projects/components/task-detail-slideover";
import { AddMemberModal } from "@/features/projects/components/add-member-modal";
import { SmartUploadSlideover } from "@/features/smart-tasks/components/smart-upload-slideover";
import { CreateInvoiceModal } from "@/features/invoices/components/create-invoice-modal";
import { InvoiceStatusPill } from "@/features/invoices/components/invoice-status-pill";
import {
  PAYMENT_METHOD_LABELS,
} from "@/features/invoices/constants/invoice.constants";
import { ContextualDiscussion } from "@/features/communication/components/contextual-discussion";
import {
  useCommentsQuery,
  useDownloadAttachmentMutation,
} from "@/features/communication/hooks/use-communication";
import { InvoiceStatus, PaymentMethod } from "@/lib/type";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ProjectDetailSkeleton } from "@/components/skeletons/page-skeletons";
import { IntegrityProofPanel } from "@/features/audit/components/integrity-proof-panel";

type ProjectPortalTab = "overview" | "tasks" | "messages" | "files" | "invoices" | "activity";

const PROJECT_PORTAL_TABS: Array<{
  id: ProjectPortalTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: ListTodo },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "files", label: "Files", icon: Paperclip },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "activity", label: "Activity", icon: ActivityIcon },
];

const TASK_STATUS_FILTER_OPTIONS: FilterDropdownOption<TaskStatusFilterValue>[] = [
  { value: "ALL", label: "All Statuses" },
  { value: TaskStatus.TODO, label: "To Do" },
  { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
  { value: TaskStatus.DONE, label: "Done" },
  { value: TaskStatus.CANCELED, label: "Cancelled" },
];

const TASK_DUE_FILTER_OPTIONS: FilterDropdownOption<TaskDueFilterValue>[] = [
  { value: "ALL", label: "Any Due Date" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "TODAY", label: "Due Today" },
  { value: "THIS_WEEK", label: "Due This Week" },
  { value: "NO_DUE_DATE", label: "No Due Date" },
];

function isProjectPortalTab(value: string | null): value is ProjectPortalTab {
  return PROJECT_PORTAL_TABS.some((tab) => tab.id === value);
}

function isOpenTask(task: Task) {
  return task.status !== TaskStatus.DONE && task.status !== TaskStatus.CANCELED;
}

function isOverdueTask(task: Task) {
  if (!task.dueDate || !isOpenTask(task)) return false;
  return new Date(task.dueDate).getTime() < Date.now();
}

function sourceLabel(sourceType: string) {
  const normalized = sourceType.toUpperCase();
  if (normalized === "PROJECT") return "Project";
  if (normalized === "TASK") return "Task";
  if (normalized === "INVOICE") return "Invoice";
  return "Project item";
}

function activityTone(entityType: string) {
  const normalized = entityType.toUpperCase();
  if (normalized === "INVOICE") return "text-amber-300 bg-amber-500/10 border-amber-500/20";
  if (normalized === "TASK") return "text-emerald-300 bg-emerald-500/10 border-emerald-500/20";
  if (normalized === "COMMENT") return "text-sky-300 bg-sky-500/10 border-sky-500/20";
  return "text-slate-300 bg-slate-500/10 border-slate-500/20";
}

function isInvoiceStatus(value: string): value is InvoiceStatus {
  return Object.values(InvoiceStatus).includes(value as InvoiceStatus);
}

function isPaymentMethod(value: string | undefined): value is PaymentMethod {
  return !!value && Object.values(PaymentMethod).includes(value as PaymentMethod);
}

function MetricTile({
  label,
  value,
  icon: Icon,
  tone = "text-slate-300",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
        <Icon className={cn("h-4 w-4", tone)} />
      </div>
      <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-8 text-center">
      <Icon className="mb-4 h-10 w-10 text-slate-600" />
      <p className="font-semibold text-slate-300">{title}</p>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  );
}

function TabErrorState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-200">
      <Icon className="mb-4 h-10 w-10 text-rose-300" />
      <p className="font-semibold text-rose-100">{title}</p>
      <p className="mt-1 max-w-md text-sm text-rose-200/80">{description}</p>
    </div>
  );
}

function ProjectFilesList({ files }: { files: ProjectFileItem[] }) {
  const downloadAttachment = useDownloadAttachmentMutation();

  if (files.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No files yet"
        description="Attachments shared in project, task, and invoice messages will appear here."
      />
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {files.map((file) => (
        <button
          type="button"
          key={`${file.commentId}-${file.fileUrl}`}
          onClick={() => downloadAttachment.mutate({
            fileUrl: file.fileUrl,
            fileName: file.fileName,
          })}
          disabled={downloadAttachment.isPending}
          className="group rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-left transition hover:border-emerald-500/30 hover:bg-slate-900 disabled:opacity-50"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">
              <Paperclip className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <p className="truncate text-sm font-bold text-white group-hover:text-emerald-200">{file.fileName}</p>
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600 group-hover:text-emerald-300" />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {sourceLabel(file.sourceType)} message by {file.authorName}
              </p>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                {formatDate(file.createdAt, { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function ActivityProof({ projectId, item }: { projectId: string; item: ProjectActivityItem }) {
  const [open, setOpen] = React.useState(false);
  const proofQuery = useProjectActivityProofQuery(projectId, item.id ?? 0, open);
  const verifyMutation = useVerifyProjectActivityProofMutation(projectId);

  if (!item.id) return null;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
      >
        {open ? "Hide integrity proof" : "View integrity proof"}
      </button>
      {open ? (
        <div className="mt-3">
          <IntegrityProofPanel
            compact
            proof={proofQuery.data}
            isLoading={proofQuery.isLoading}
            isError={proofQuery.isError}
            onVerify={() => verifyMutation.mutate(item.id!)}
            isVerifying={verifyMutation.isPending}
          />
        </div>
      ) : null}
    </div>
  );
}

function ProjectActivityList({ projectId, activity }: { projectId: string; activity: ProjectActivityItem[] }) {
  if (activity.length === 0) {
    return (
      <EmptyState
        icon={ActivityIcon}
        title="No activity yet"
        description="Project, task, invoice, and message changes will appear here as the workspace moves."
      />
    );
  }

  return (
    <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
      {activity.map((item, index) => (
        <div key={`${item.id ?? item.entityId}-${index}`} className="flex gap-4 p-4">
          <div className={cn("mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border", activityTone(item.entityType))}>
            <ActivityIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-100">{item.label}</p>
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {sourceLabel(item.entityType)}
              </span>
              <span className={cn(
                "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                item.proofStatus === "VERIFIED" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
                item.proofStatus === "PENDING" && "border-amber-500/30 bg-amber-500/10 text-amber-300",
                item.proofStatus === "TAMPERED" && "border-rose-500/30 bg-rose-500/10 text-rose-300",
                item.proofStatus === "CHAIN_UNAVAILABLE" && "border-sky-500/30 bg-sky-500/10 text-sky-300",
                item.proofStatus === "NOT_ANCHORED" && "border-slate-700 bg-slate-800/60 text-slate-400",
              )}>
                {item.proofStatus === "NOT_ANCHORED" ? "Waiting for anchor" : item.proofStatus.replace(/_/g, " ")}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {item.actorName} - {formatDate(item.createdAt, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
            <ActivityProof projectId={projectId} item={item} />
          </div>
        </div>
      ))}
    </div>
  );
}

function InvoiceRows({
  invoices,
  onCreateInvoice,
  canManageProject,
}: {
  invoices: ProjectInvoice[];
  onCreateInvoice: () => void;
  canManageProject: boolean;
}) {
  if (invoices.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={Receipt}
          title="No invoices yet"
          description="Invoices created for this project will appear here with their payment state."
        />
        {canManageProject ? (
          <button
            type="button"
            onClick={onCreateInvoice}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[720px] text-left">
          <thead className="border-b border-white/10 bg-slate-950/50">
            <tr>
              <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Invoice</th>
              <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Amount</th>
              <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
              <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Payment</th>
              <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {invoices.map((invoice) => {
              const status = isInvoiceStatus(invoice.status) ? invoice.status : InvoiceStatus.DRAFT;
              const paymentMethod = isPaymentMethod(invoice.paymentMethod) ? invoice.paymentMethod : undefined;

              return (
                <tr key={invoice.id} className="transition hover:bg-slate-800/40">
                  <td className="px-5 py-4">
                    <Link href={`/invoices/${invoice.id}`} className="font-mono text-sm font-bold text-slate-200 hover:text-emerald-300">
                      {formatInvoiceId(invoice.id)}
                    </Link>
                    {invoice.title ? <p className="mt-1 max-w-xs truncate text-xs text-slate-500">{invoice.title}</p> : null}
                  </td>
                  <td className="px-5 py-4 font-mono text-sm font-bold text-white">{formatFiat(invoice.amount)}</td>
                  <td className="px-5 py-4">
                    <InvoiceStatusPill status={status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-400">
                    {paymentMethod ? PAYMENT_METHOD_LABELS[paymentMethod] : "Payment method pending"}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-400">
                    {formatDate(invoice.dueDate, { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab");
  const activeTab: ProjectPortalTab = isProjectPortalTab(tabParam) ? tabParam : "overview";

  const { user } = useAuthStore();
  const role = user?.role;
  const canManageProject = role === "CLIENT" || role === "ADMIN";
  const queryClient = useQueryClient();

  const { data: project, isLoading: isProjectLoading, isError: isProjectError } = useProjectDetailQuery(projectId);
  const { data: members = [], isLoading: isMembersLoading } = useProjectMembersQuery(projectId);
  const { data: invoices = [], isLoading: isInvoicesLoading } = useProjectInvoicesQuery(projectId);
  const { data: progress } = useProjectProgressQuery(projectId);
  const { data: files = [], isLoading: isFilesLoading, isError: isFilesError } = useProjectFilesQuery(projectId);
  const { data: activity = [], isLoading: isActivityLoading, isError: isActivityError } =
    useProjectActivityQuery(projectId, activeTab === "activity");
  const { data: projectMessages = [] } = useCommentsQuery("PROJECT", projectId);

  const taskParams = React.useMemo(() => ({ projectId, page: 0, size: 50 }), [projectId]);
  const { data: tasksPage, isLoading: isTasksLoading, isError: isTasksError } = useTasksQuery(taskParams);
  const tasks = React.useMemo(() => tasksPage?.content ?? [], [tasksPage?.content]);

  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = React.useState(false);
  const [defaultStatus, setDefaultStatus] = React.useState(TaskStatus.TODO);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [tasksViewMode, setTasksViewMode] = React.useState<TasksViewMode>("kanban");
  const [taskPriorityFilter, setTaskPriorityFilter] = React.useState<TaskPriorityFilterValue>("ALL");
  const [taskStatusFilter, setTaskStatusFilter] = React.useState<TaskStatusFilterValue>("ALL");
  const [taskDueFilter, setTaskDueFilter] = React.useState<TaskDueFilterValue>("ALL");
  const [taskAssigneeId, setTaskAssigneeId] = React.useState<string | undefined>();
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = React.useState(false);
  const [advancedFilters, setAdvancedFilters] = React.useState<AdvancedFilters>(DEFAULT_ADVANCED_FILTERS);
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);
  const [isSmartUploadOpen, setIsSmartUploadOpen] = React.useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = React.useState(false);

  const { mutate: addMember, isPending: isAddingMember } = useAddMemberMutation(projectId);
  const { mutate: removeMember, isPending: isRemovingMember } = useRemoveMemberMutation(projectId);

  const canManageMembers = role === "ADMIN" || (!!user?.id && project?.ownerId === user.id);
  const openTasks = tasks.filter(isOpenTask);
  const doneTasks = tasks.filter((task) => task.status === TaskStatus.DONE);
  const overdueTasks = tasks.filter(isOverdueTask);
  const urgentTasks = tasks.filter((task) => task.priority === TaskPriority.URGENT && isOpenTask(task));
  const paidInvoices = invoices.filter((invoice) => invoice.status === InvoiceStatus.PAID);
  const openInvoices = invoices.filter((invoice) => invoice.status !== InvoiceStatus.PAID && invoice.status !== InvoiceStatus.REFUNDED);
  const invoiceTotal = invoices.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
  const taskAssigneeOptions = React.useMemo<FilterDropdownOption<string | "ALL">[]>(
    () => [
      { value: "ALL", label: "All Assignees" },
      ...members.map((member) => ({
        value: member.userId,
        label: member.fullName || member.email,
      })),
    ],
    [members],
  );
  const filteredTasks = React.useMemo(
    () =>
      tasks
        .filter((task) => taskPriorityFilter === "ALL" || task.priority === taskPriorityFilter)
        .filter((task) => taskStatusFilter === "ALL" || task.status === taskStatusFilter)
        .filter((task) => !taskAssigneeId || task.assignedTo?.id === taskAssigneeId)
        .filter((task) => isTaskMatchingDueFilter(task, taskDueFilter))
        .filter((task) => isTaskMatchingAdvancedFilters(task, advancedFilters)),
    [advancedFilters, taskAssigneeId, taskDueFilter, taskPriorityFilter, tasks, taskStatusFilter],
  );
  const hasActiveAdvancedFilters = React.useMemo(
    () =>
      advancedFilters.keyword.trim() !== "" ||
      advancedFilters.statuses.length > 0 ||
      advancedFilters.minEstimate.trim() !== "" ||
      advancedFilters.maxEstimate.trim() !== "",
    [advancedFilters],
  );

  const handleTabChange = (tab: ProjectPortalTab) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("tab", tab);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

  const handleAddTask = (status: TaskStatus) => {
    setDefaultStatus(status);
    setIsCreateTaskModalOpen(true);
  };

  const handleAddMember = (userId: string) => {
    addMember(userId, {
      onSuccess: () => setIsAddMemberOpen(false),
    });
  };

  if (isProjectLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (isProjectError || !project) {
    return (
      <div className="mx-auto mt-20 max-w-2xl rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-300 ring-1 ring-rose-500/30">
        <h2 className="mb-2 text-xl font-bold tracking-tight text-rose-100">Access Denied or Project Missing</h2>
        <p className="text-sm">The requested project could not be loaded for your workspace.</p>
        <Link href="/projects" className="mt-6 inline-block rounded-xl bg-rose-500/20 px-5 py-2.5 text-sm font-bold text-rose-100 transition-colors hover:bg-rose-500/30">
          Return to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] space-y-6 font-body">
      <Link href="/projects" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-emerald-400">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Projects
      </Link>

      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">
                <FolderGit2 className="h-5 w-5" />
              </div>
              <ProjectStatusBadge status={project.status} />
              <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {progress?.progressPercent ?? 0}% Complete
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{project.title}</h1>
              {project.description ? (
                <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400">{project.description}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                {formatDate(project.deadline, { day: "2-digit", month: "short", year: "numeric" })}
              </span>
              {canManageProject ? (
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2">
                  <DollarSign className="h-4 w-4 text-emerald-300" />
                  {formatFiat(project.budget)}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2">
                <Users className="h-4 w-4 text-sky-300" />
                Owner: {project.ownerName || project.ownerEmail}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSmartUploadOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-600/20 px-4 py-2.5 text-sm font-bold text-indigo-200 transition hover:border-indigo-400/50 hover:bg-indigo-600/30"
            >
              <Sparkles className="h-4 w-4" />
              Smart Upload
            </button>
            <button
              type="button"
              onClick={() => handleAddTask(TaskStatus.TODO)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          </div>
        </div>
      </section>

      <div className="overflow-x-auto custom-scrollbar">
        <div className="flex min-w-max gap-2 rounded-2xl border border-white/10 bg-slate-950/50 p-2">
          {PROJECT_PORTAL_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition",
                  isActive
                    ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30"
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-200",
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "overview" ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricTile label="Progress" value={`${progress?.progressPercent ?? 0}%`} icon={CheckCircle2} tone="text-emerald-300" />
              <MetricTile label="Open Tasks" value={String(openTasks.length)} icon={ListTodo} tone="text-sky-300" />
              <MetricTile label="Open Invoices" value={String(openInvoices.length)} icon={Receipt} tone="text-amber-300" />
              <MetricTile label="Files" value={String(files.length)} icon={Paperclip} tone="text-indigo-300" />
            </div>

            {(isFilesError || isActivityError) ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                  <div>
                    <p className="font-bold">Some portal panels did not load.</p>
                    <p className="mt-1 text-amber-100/80">
                      Project details are still available. Check the Files or Activity tab for the failed panel and retry after the API is healthy.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-white">Task Snapshot</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {doneTasks.length} of {progress?.totalTasks ?? tasks.length} tasks completed
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabChange("tasks")}
                  className="text-sm font-bold text-emerald-300 transition hover:text-emerald-200"
                >
                  View Tasks
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Waiting</p>
                  <p className="mt-2 text-2xl font-bold text-white">{tasks.filter((task) => task.status === TaskStatus.TODO).length}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Overdue</p>
                  <p className="mt-2 text-2xl font-bold text-rose-300">{overdueTasks.length}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Urgent</p>
                  <p className="mt-2 text-2xl font-bold text-amber-300">{urgentTasks.length}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-white">Invoice Summary</h2>
                  <p className="mt-1 text-sm text-slate-500">{formatFiat(invoiceTotal)} across {invoices.length} invoices</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabChange("invoices")}
                  className="text-sm font-bold text-emerald-300 transition hover:text-emerald-200"
                >
                  View Invoices
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Paid</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-300">{paidInvoices.length}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Open</p>
                  <p className="mt-2 text-2xl font-bold text-amber-300">{openInvoices.length}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total</p>
                  <p className="mt-2 text-2xl font-bold text-white">{formatFiat(invoiceTotal)}</p>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-bold text-white">Members</h2>
                {canManageMembers ? (
                  <button
                    type="button"
                    onClick={() => setIsAddMemberOpen(true)}
                    className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300 ring-1 ring-emerald-500/20"
                  >
                    Add
                  </button>
                ) : null}
              </div>
              <div className="space-y-3">
                {isMembersLoading ? (
                  [1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-white/5" />)
                ) : members.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-slate-500">No project members yet.</p>
                ) : (
                  members.map((member) => (
                    <div key={member.userId} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <UserAvatar name={member.fullName || member.email} sizeClass="h-9 w-9 text-[10px]" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">{member.fullName || member.email}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{member.role}</p>
                        </div>
                      </div>
                      {canManageMembers && member.role === "FREELANCER" ? (
                        <button
                          type="button"
                          aria-label="Remove member"
                          onClick={() => removeMember(member.userId)}
                          disabled={isRemovingMember}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-bold text-white">Latest Messages</h2>
                <button
                  type="button"
                  onClick={() => handleTabChange("messages")}
                  className="text-xs font-bold text-emerald-300 transition hover:text-emerald-200"
                >
                  Open
                </button>
              </div>
              <div className="space-y-3">
                {projectMessages.slice(0, 3).map((message) => (
                  <div key={message.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                    <p className="line-clamp-2 text-sm text-slate-300">{message.content}</p>
                    <p className="mt-2 text-xs text-slate-600">
                      {message.author.fullName || message.author.email} - {formatDate(message.createdAt)}
                    </p>
                  </div>
                ))}
                {projectMessages.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-slate-500">No project messages yet.</p>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      ) : null}

      {activeTab === "tasks" ? (
        <section className="min-h-[650px] overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
          <div className="space-y-4 border-b border-white/10 bg-slate-950/40 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-white">Tasks</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {filteredTasks.length} shown from {tasks.length} total - {openTasks.length} open, {doneTasks.length} completed
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSmartUploadOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-600/20 px-4 py-2.5 text-sm font-bold text-indigo-200 transition hover:border-indigo-400/50 hover:bg-indigo-600/30"
                >
                  <Sparkles className="h-4 w-4" />
                  Smart Upload
                </button>
                <button
                  type="button"
                  onClick={() => handleAddTask(TaskStatus.TODO)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500"
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setTasksViewMode("kanban")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    tasksViewMode === "kanban" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300",
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Kanban
                </button>
                <button
                  type="button"
                  onClick={() => setTasksViewMode("list")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    tasksViewMode === "list" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300",
                  )}
                >
                  <List className="h-3.5 w-3.5" />
                  List
                </button>
              </div>
              <FilterDropdown
                icon={Flag}
                label="Priority"
                options={[{ value: "ALL" as const, label: "All Priorities" }, ...TASK_PRIORITY_OPTIONS]}
                value={taskPriorityFilter}
                onChange={(value) => setTaskPriorityFilter(value)}
              />
              <FilterDropdown
                icon={User}
                label="Assignee"
                options={taskAssigneeOptions}
                value={taskAssigneeId ?? "ALL"}
                onChange={(value) => setTaskAssigneeId(value === "ALL" ? undefined : value)}
              />
              <FilterDropdown
                icon={Check}
                label="Status"
                options={TASK_STATUS_FILTER_OPTIONS}
                value={taskStatusFilter}
                onChange={(value) => setTaskStatusFilter(value)}
              />
              <FilterDropdown
                icon={TimerReset}
                label="Due"
                options={TASK_DUE_FILTER_OPTIONS}
                value={taskDueFilter}
                onChange={(value) => setTaskDueFilter(value)}
              />
              <button
                type="button"
                onClick={() => setIsAdvancedFiltersOpen(true)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                  hasActiveAdvancedFilters
                    ? "border-emerald-500/30 bg-emerald-500/12 text-emerald-300"
                    : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200",
                )}
              >
                <SlidersHorizontal className={cn("h-3 w-3", hasActiveAdvancedFilters ? "text-emerald-300" : "text-slate-500")} />
                Advanced
                {hasActiveAdvancedFilters ? (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-400/20 px-1 text-[10px] font-semibold text-emerald-300">
                    ON
                  </span>
                ) : null}
              </button>
            </div>
          </div>
          {isTasksError ? (
            <div className="m-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-center text-sm text-rose-300">
              Failed to load tasks for this project.
            </div>
          ) : isTasksLoading ? (
            <div className="flex h-full gap-4 p-6">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-[32rem] flex-1 animate-pulse rounded-2xl bg-slate-800/50" />)}
            </div>
          ) : tasksViewMode === "list" ? (
            <div className="px-5 pb-5">
              <TaskList tasks={filteredTasks} onTaskClick={setSelectedTask} />
            </div>
          ) : (
            <TaskBoard tasks={filteredTasks} currentParams={taskParams} onAddTask={handleAddTask} onTaskClick={setSelectedTask} />
          )}
        </section>
      ) : null}

      {activeTab === "messages" ? (
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
          <div className="border-b border-white/10 bg-slate-950/40 px-5 py-4">
            <h2 className="font-bold text-white">Messages</h2>
            <p className="mt-1 text-sm text-slate-500">Project-level conversation for everyone with access.</p>
          </div>
          <ContextualDiscussion
            targetType="PROJECT"
            targetId={projectId}
            emptyTitle="No project messages yet"
            emptyDescription="Start the project conversation here."
            className="min-h-[36rem] border-0"
          />
        </section>
      ) : null}

      {activeTab === "files" ? (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-white">Files</h2>
              <p className="mt-1 text-sm text-slate-500">Attachments collected from project, task, and invoice messages.</p>
            </div>
            <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {files.length} Files
            </span>
          </div>
          <ProjectFileUploadZone projectId={projectId} />
          {isFilesLoading ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-900/60" />)}
            </div>
          ) : isFilesError ? (
            <TabErrorState
              icon={Paperclip}
              title="Files could not be loaded"
              description="The project is available, but the file aggregation API did not respond successfully."
            />
          ) : (
            <ProjectFilesList files={files} />
          )}
        </section>
      ) : null}

      {activeTab === "invoices" ? (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-white">Invoices</h2>
              <p className="mt-1 text-sm text-slate-500">
                {paidInvoices.length} paid, {openInvoices.length} open, {formatFiat(invoiceTotal)} total
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {canManageProject ? (
                <button
                  type="button"
                  onClick={() => setIsCreateInvoiceOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500"
                >
                  <Plus className="h-4 w-4" />
                  Create Invoice
                </button>
              ) : null}
              <Link href={`/invoices?projectId=${projectId}`} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/5 hover:text-white">
                View All
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
          {isInvoicesLoading ? (
            <div className="h-72 animate-pulse rounded-2xl bg-slate-900/60" />
          ) : (
            <InvoiceRows invoices={invoices} onCreateInvoice={() => setIsCreateInvoiceOpen(true)} canManageProject={canManageProject} />
          )}
        </section>
      ) : null}

      {activeTab === "activity" ? (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-white">Activity</h2>
              <p className="mt-1 text-sm text-slate-500">Client-friendly history from project audit events.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <Clock3 className="h-3.5 w-3.5" />
              Latest 20
            </span>
          </div>
          {isActivityLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-900/60" />)}
            </div>
          ) : isActivityError ? (
            <TabErrorState
              icon={ActivityIcon}
              title="Activity could not be loaded"
              description="The project is available, but the activity timeline API did not respond successfully."
            />
          ) : (
            <ProjectActivityList projectId={projectId} activity={activity} />
          )}
        </section>
      ) : null}

      {overdueTasks.length > 0 && activeTab === "overview" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {overdueTasks.length} open task{overdueTasks.length === 1 ? " is" : "s are"} past the due date.
        </div>
      ) : null}

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        defaultStatus={defaultStatus}
        defaultProjectId={projectId}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        projectId={projectId}
        currentMemberIds={members.map((member) => member.userId)}
        isPending={isAddingMember}
        onClose={() => setIsAddMemberOpen(false)}
        onSubmit={handleAddMember}
      />

      <TaskDetailSlideover
        task={selectedTask}
        isClient={canManageProject}
        projectMembers={members}
        projectParams={taskParams}
        currentUserId={user?.id}
        onClose={() => setSelectedTask(null)}
      />

      <SmartUploadSlideover
        isOpen={isSmartUploadOpen}
        projectId={projectId}
        onClose={() => setIsSmartUploadOpen(false)}
        onTasksCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["tasks", "list"] });
        }}
      />

      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        defaultProjectId={projectId}
      />

      <TaskAdvancedFilters
        isOpen={isAdvancedFiltersOpen}
        onClose={() => setIsAdvancedFiltersOpen(false)}
        filters={advancedFilters}
        onApply={setAdvancedFilters}
        onReset={() => setAdvancedFilters(DEFAULT_ADVANCED_FILTERS)}
      />
    </div>
  );
}
