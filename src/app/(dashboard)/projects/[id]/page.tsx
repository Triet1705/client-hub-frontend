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
  if (normalized === "INVOICE") return "text-status-warning-text bg-status-warning-surface border-status-warning-border";
  if (normalized === "TASK") return "text-theme-accent bg-action-subtle border-theme-accent";
  if (normalized === "COMMENT") return "text-status-info-text bg-status-info-surface border-status-info-border";
  return "text-content-secondary bg-status-neutral-surface border-content-muted/20";
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
  tone = "text-content-secondary",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-theme-border bg-surface/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-content-muted">{label}</span>
        <Icon className={cn("h-4 w-4", tone)} />
      </div>
      <p className="text-2xl font-bold tracking-tight text-content-primary">{value}</p>
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
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-theme-border bg-surface/40 p-8 text-center">
      <Icon className="mb-4 h-10 w-10 text-content-muted" />
      <p className="font-semibold text-content-secondary">{title}</p>
      <p className="mt-1 max-w-md text-sm text-content-muted">{description}</p>
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
    <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-status-danger-border bg-status-danger-surface p-8 text-center text-status-danger-text">
      <Icon className="mb-4 h-10 w-10 text-status-danger-text" />
      <p className="font-semibold text-status-danger-text">{title}</p>
      <p className="mt-1 max-w-md text-sm text-status-danger-text/80">{description}</p>
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
          className="group rounded-2xl border border-theme-border bg-surface/60 p-4 text-left transition hover:border-theme-accent hover:bg-surface disabled:opacity-50"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-action-subtle text-theme-accent ring-1 ring-theme-accent">
              <Paperclip className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <p className="truncate text-sm font-bold text-content-primary group-hover:text-theme-accent">{file.fileName}</p>
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-content-muted group-hover:text-theme-accent" />
              </div>
              <p className="mt-1 text-xs text-content-muted">
                {sourceLabel(file.sourceType)} message by {file.authorName}
              </p>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-content-muted">
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
        className="text-xs font-semibold text-theme-accent hover:text-theme-accent"
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
    <div className="divide-y divide-theme-border overflow-hidden rounded-2xl border border-theme-border bg-surface/60">
      {activity.map((item, index) => (
        <div key={`${item.id ?? item.entityId}-${index}`} className="flex gap-4 p-4">
          <div className={cn("mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border", activityTone(item.entityType))}>
            <ActivityIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-content-primary">{item.label}</p>
              <span className="rounded-md border border-theme-border bg-surface-sunken px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-content-muted">
                {sourceLabel(item.entityType)}
              </span>
              <span className={cn(
                "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                item.proofStatus === "VERIFIED" && "border-theme-accent bg-action-subtle text-theme-accent",
                item.proofStatus === "PENDING" && "border-status-warning-border bg-status-warning-surface text-status-warning-text",
                item.proofStatus === "TAMPERED" && "border-status-danger-border bg-status-danger-surface text-status-danger-text",
                item.proofStatus === "CHAIN_UNAVAILABLE" && "border-status-info-border bg-status-info-surface text-status-info-text",
                item.proofStatus === "NOT_ANCHORED" && "border-theme-border bg-surface-elevated/60 text-content-secondary",
              )}>
                {item.proofStatus === "NOT_ANCHORED" ? "Waiting for anchor" : item.proofStatus.replace(/_/g, " ")}
              </span>
            </div>
            <p className="mt-1 text-sm text-content-muted">
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
            className="inline-flex items-center gap-2 rounded-xl bg-action-primary px-4 py-2.5 text-sm font-bold text-action-primary-foreground transition hover:bg-action-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-theme-border bg-surface/60">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[720px] text-left">
          <thead className="border-b border-theme-border bg-surface-base/50">
            <tr>
              <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-content-muted">Invoice</th>
              <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-content-muted">Amount</th>
              <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-content-muted">Status</th>
              <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-content-muted">Payment</th>
              <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-content-muted">Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border">
            {invoices.map((invoice) => {
              const status = isInvoiceStatus(invoice.status) ? invoice.status : InvoiceStatus.DRAFT;
              const paymentMethod = isPaymentMethod(invoice.paymentMethod) ? invoice.paymentMethod : undefined;

              return (
                <tr key={invoice.id} className="transition hover:bg-surface-elevated/40">
                  <td className="px-5 py-4">
                    <Link href={`/invoices/${invoice.id}`} className="font-mono text-sm font-bold text-content-secondary hover:text-theme-accent">
                      {formatInvoiceId(invoice.id)}
                    </Link>
                    {invoice.title ? <p className="mt-1 max-w-xs truncate text-xs text-content-muted">{invoice.title}</p> : null}
                  </td>
                  <td className="px-5 py-4 font-mono text-sm font-bold text-content-primary">{formatFiat(invoice.amount)}</td>
                  <td className="px-5 py-4">
                    <InvoiceStatusPill status={status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-content-secondary">
                    {paymentMethod ? PAYMENT_METHOD_LABELS[paymentMethod] : "Payment method pending"}
                  </td>
                  <td className="px-5 py-4 text-sm text-content-secondary">
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
      <div className="mx-auto mt-20 max-w-2xl rounded-2xl border border-status-danger-border bg-status-danger-surface p-8 text-center text-status-danger-text ring-1 ring-status-danger-border">
        <h2 className="mb-2 text-xl font-bold tracking-tight text-status-danger-text">Access Denied or Project Missing</h2>
        <p className="text-sm">The requested project could not be loaded for your workspace.</p>
        <Link href="/projects" className="mt-6 inline-block rounded-xl bg-status-danger-surface px-5 py-2.5 text-sm font-bold text-status-danger-text transition-colors hover:bg-status-danger-surface">
          Return to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] space-y-6 font-body">
      <Link href="/projects" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-content-muted transition-colors hover:text-theme-accent">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Projects
      </Link>

      <section className="rounded-2xl border border-theme-border bg-surface/60 p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-action-subtle text-theme-accent ring-1 ring-theme-accent">
                <FolderGit2 className="h-5 w-5" />
              </div>
              <ProjectStatusBadge status={project.status} />
              <span className="rounded-md border border-theme-border bg-surface-sunken px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-content-muted">
                {progress?.progressPercent ?? 0}% Complete
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-content-primary md:text-4xl">{project.title}</h1>
              {project.description ? (
                <p className="mt-3 max-w-4xl text-sm leading-6 text-content-secondary">{project.description}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-content-secondary">
              <span className="inline-flex items-center gap-2 rounded-xl border border-theme-border bg-surface-base/50 px-3 py-2">
                <Calendar className="h-4 w-4 text-content-muted" />
                {formatDate(project.deadline, { day: "2-digit", month: "short", year: "numeric" })}
              </span>
              {canManageProject ? (
                <span className="inline-flex items-center gap-2 rounded-xl border border-theme-border bg-surface-base/50 px-3 py-2">
                  <DollarSign className="h-4 w-4 text-theme-accent" />
                  {formatFiat(project.budget)}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2 rounded-xl border border-theme-border bg-surface-base/50 px-3 py-2">
                <Users className="h-4 w-4 text-status-info-text" />
                Owner: {project.ownerName || project.ownerEmail}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSmartUploadOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-status-web3-border bg-status-web3-surface px-4 py-2.5 text-sm font-bold text-status-web3-text transition hover:border-status-web3-border hover:bg-status-web3-surface"
            >
              <Sparkles className="h-4 w-4" />
              Smart Upload
            </button>
            <button
              type="button"
              onClick={() => handleAddTask(TaskStatus.TODO)}
              className="inline-flex items-center gap-2 rounded-xl bg-action-primary px-4 py-2.5 text-sm font-bold text-action-primary-foreground transition hover:bg-action-primary-hover"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          </div>
        </div>
      </section>

      <div className="overflow-x-auto custom-scrollbar">
        <div className="flex min-w-max gap-2 rounded-2xl border border-theme-border bg-surface-base/50 p-2">
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
                    ? "bg-action-subtle text-theme-accent ring-1 ring-theme-accent"
                    : "text-content-muted hover:bg-surface-sunken hover:text-content-secondary",
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
              <MetricTile label="Progress" value={`${progress?.progressPercent ?? 0}%`} icon={CheckCircle2} tone="text-theme-accent" />
              <MetricTile label="Open Tasks" value={String(openTasks.length)} icon={ListTodo} tone="text-status-info-text" />
              <MetricTile label="Open Invoices" value={String(openInvoices.length)} icon={Receipt} tone="text-status-warning-text" />
              <MetricTile label="Files" value={String(files.length)} icon={Paperclip} tone="text-status-web3-text" />
            </div>

            {(isFilesError || isActivityError) ? (
              <div className="rounded-2xl border border-status-warning-border bg-status-warning-surface p-4 text-sm text-status-warning-text">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-status-warning-text" />
                  <div>
                    <p className="font-bold">Some portal panels did not load.</p>
                    <p className="mt-1 text-status-warning-text/80">
                      Project details are still available. Check the Files or Activity tab for the failed panel and retry after the API is healthy.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <section className="rounded-2xl border border-theme-border bg-surface/60 p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-content-primary">Task Snapshot</h2>
                  <p className="mt-1 text-sm text-content-muted">
                    {doneTasks.length} of {progress?.totalTasks ?? tasks.length} tasks completed
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabChange("tasks")}
                  className="text-sm font-bold text-theme-accent transition hover:text-theme-accent"
                >
                  View Tasks
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-theme-border bg-surface-base/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Waiting</p>
                  <p className="mt-2 text-2xl font-bold text-content-primary">{tasks.filter((task) => task.status === TaskStatus.TODO).length}</p>
                </div>
                <div className="rounded-xl border border-theme-border bg-surface-base/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Overdue</p>
                  <p className="mt-2 text-2xl font-bold text-status-danger-text">{overdueTasks.length}</p>
                </div>
                <div className="rounded-xl border border-theme-border bg-surface-base/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Urgent</p>
                  <p className="mt-2 text-2xl font-bold text-status-warning-text">{urgentTasks.length}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-theme-border bg-surface/60 p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-content-primary">Invoice Summary</h2>
                  <p className="mt-1 text-sm text-content-muted">{formatFiat(invoiceTotal)} across {invoices.length} invoices</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabChange("invoices")}
                  className="text-sm font-bold text-theme-accent transition hover:text-theme-accent"
                >
                  View Invoices
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-theme-border bg-surface-base/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Paid</p>
                  <p className="mt-2 text-2xl font-bold text-theme-accent">{paidInvoices.length}</p>
                </div>
                <div className="rounded-xl border border-theme-border bg-surface-base/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Open</p>
                  <p className="mt-2 text-2xl font-bold text-status-warning-text">{openInvoices.length}</p>
                </div>
                <div className="rounded-xl border border-theme-border bg-surface-base/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Total</p>
                  <p className="mt-2 text-2xl font-bold text-content-primary">{formatFiat(invoiceTotal)}</p>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-theme-border bg-surface/60 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-bold text-content-primary">Members</h2>
                {canManageMembers ? (
                  <button
                    type="button"
                    onClick={() => setIsAddMemberOpen(true)}
                    className="rounded-lg bg-action-subtle px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-theme-accent ring-1 ring-theme-accent"
                  >
                    Add
                  </button>
                ) : null}
              </div>
              <div className="space-y-3">
                {isMembersLoading ? (
                  [1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-surface-sunken" />)
                ) : members.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-theme-border p-4 text-center text-sm text-content-muted">No project members yet.</p>
                ) : (
                  members.map((member) => (
                    <div key={member.userId} className="flex items-center justify-between gap-3 rounded-xl border border-theme-border bg-surface-base/40 p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <UserAvatar name={member.fullName || member.email} sizeClass="h-9 w-9 text-[10px]" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-content-primary">{member.fullName || member.email}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">{member.role}</p>
                        </div>
                      </div>
                      {canManageMembers && member.role === "FREELANCER" ? (
                        <button
                          type="button"
                          aria-label="Remove member"
                          onClick={() => removeMember(member.userId)}
                          disabled={isRemovingMember}
                          className="rounded-lg p-2 text-content-muted transition hover:bg-status-danger-surface hover:text-status-danger-text disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-theme-border bg-surface/60 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-bold text-content-primary">Latest Messages</h2>
                <button
                  type="button"
                  onClick={() => handleTabChange("messages")}
                  className="text-xs font-bold text-theme-accent transition hover:text-theme-accent"
                >
                  Open
                </button>
              </div>
              <div className="space-y-3">
                {projectMessages.slice(0, 3).map((message) => (
                  <div key={message.id} className="rounded-xl border border-theme-border bg-surface-base/40 p-3">
                    <p className="line-clamp-2 text-sm text-content-secondary">{message.content}</p>
                    <p className="mt-2 text-xs text-content-muted">
                      {message.author.fullName || message.author.email} - {formatDate(message.createdAt)}
                    </p>
                  </div>
                ))}
                {projectMessages.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-theme-border p-4 text-center text-sm text-content-muted">No project messages yet.</p>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      ) : null}

      {activeTab === "tasks" ? (
        <section className="min-h-[650px] overflow-hidden rounded-2xl border border-theme-border bg-surface/60">
          <div className="space-y-4 border-b border-theme-border bg-surface-base/40 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-content-primary">Tasks</h2>
                <p className="mt-1 text-sm text-content-muted">
                  {filteredTasks.length} shown from {tasks.length} total - {openTasks.length} open, {doneTasks.length} completed
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSmartUploadOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-status-web3-border bg-status-web3-surface px-4 py-2.5 text-sm font-bold text-status-web3-text transition hover:border-status-web3-border hover:bg-status-web3-surface"
                >
                  <Sparkles className="h-4 w-4" />
                  Smart Upload
                </button>
                <button
                  type="button"
                  onClick={() => handleAddTask(TaskStatus.TODO)}
                  className="inline-flex items-center gap-2 rounded-xl bg-action-primary px-4 py-2.5 text-sm font-bold text-action-primary-foreground transition hover:bg-action-primary-hover"
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-0.5 rounded-lg border border-theme-border bg-surface-sunken p-1">
                <button
                  type="button"
                  onClick={() => setTasksViewMode("kanban")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    tasksViewMode === "kanban" ? "bg-surface-sunken text-content-primary" : "text-content-muted hover:text-content-secondary",
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
                    tasksViewMode === "list" ? "bg-surface-sunken text-content-primary" : "text-content-muted hover:text-content-secondary",
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
                    ? "border-theme-accent bg-action-subtle text-theme-accent"
                    : "border-theme-border bg-surface-sunken text-content-secondary hover:border-theme-border hover:text-content-secondary",
                )}
              >
                <SlidersHorizontal className={cn("h-3 w-3", hasActiveAdvancedFilters ? "text-theme-accent" : "text-content-muted")} />
                Advanced
                {hasActiveAdvancedFilters ? (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-action-subtle px-1 text-[10px] font-semibold text-theme-accent">
                    ON
                  </span>
                ) : null}
              </button>
            </div>
          </div>
          {isTasksError ? (
            <div className="m-6 rounded-2xl border border-status-danger-border bg-status-danger-surface p-5 text-center text-sm text-status-danger-text">
              Failed to load tasks for this project.
            </div>
          ) : isTasksLoading ? (
            <div className="flex h-full gap-4 p-6">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-[32rem] flex-1 animate-pulse rounded-2xl bg-surface-elevated/50" />)}
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
        <section className="overflow-hidden rounded-2xl border border-theme-border bg-surface/60">
          <div className="border-b border-theme-border bg-surface-base/40 px-5 py-4">
            <h2 className="font-bold text-content-primary">Messages</h2>
            <p className="mt-1 text-sm text-content-muted">Project-level conversation for everyone with access.</p>
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
              <h2 className="font-bold text-content-primary">Files</h2>
              <p className="mt-1 text-sm text-content-muted">Attachments collected from project, task, and invoice messages.</p>
            </div>
            <span className="rounded-md border border-theme-border bg-surface-sunken px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-content-muted">
              {files.length} Files
            </span>
          </div>
          <ProjectFileUploadZone projectId={projectId} />
          {isFilesLoading ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-surface/60" />)}
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
              <h2 className="font-bold text-content-primary">Invoices</h2>
              <p className="mt-1 text-sm text-content-muted">
                {paidInvoices.length} paid, {openInvoices.length} open, {formatFiat(invoiceTotal)} total
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {canManageProject ? (
                <button
                  type="button"
                  onClick={() => setIsCreateInvoiceOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-action-primary px-4 py-2.5 text-sm font-bold text-action-primary-foreground transition hover:bg-action-primary-hover"
                >
                  <Plus className="h-4 w-4" />
                  Create Invoice
                </button>
              ) : null}
              <Link href={`/invoices?projectId=${projectId}`} className="inline-flex items-center gap-2 rounded-xl border border-theme-border px-4 py-2.5 text-sm font-bold text-content-secondary transition hover:bg-surface-sunken hover:text-content-primary">
                View All
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
          {isInvoicesLoading ? (
            <div className="h-72 animate-pulse rounded-2xl bg-surface/60" />
          ) : (
            <InvoiceRows invoices={invoices} onCreateInvoice={() => setIsCreateInvoiceOpen(true)} canManageProject={canManageProject} />
          )}
        </section>
      ) : null}

      {activeTab === "activity" ? (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-content-primary">Activity</h2>
              <p className="mt-1 text-sm text-content-muted">Client-friendly history from project audit events.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-md border border-theme-border bg-surface-sunken px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-content-muted">
              <Clock3 className="h-3.5 w-3.5" />
              Latest 20
            </span>
          </div>
          {isActivityLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-surface/60" />)}
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
        <div className="flex items-center gap-3 rounded-2xl border border-status-danger-border bg-status-danger-surface p-4 text-sm text-status-danger-text">
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
