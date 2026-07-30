"use client";

import * as React from "react";
import type { AxiosError } from "axios";
import {
  MessageSquare, Paperclip, Pin, Search, Send, User,
  FolderOpen, Receipt, Sparkles, Clock, CreditCard, LayoutList, X
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useInvoicesQuery } from "@/features/invoices/hooks/use-invoices";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects";
import { useTasksQuery } from "@/features/tasks/hooks/use-tasks";
import {
  useCommentsQuery,
  useDownloadAttachmentMutation,
  usePostCommentMutation,
  useUploadAttachmentMutation,
} from "@/features/communication/hooks/use-communication";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import type { CommentTargetType } from "@/features/communication/types/comment.types";
import type { Project } from "@/features/projects/types/project.types";
import type { Task } from "@/features/tasks/types/task.types";
import { cn, formatFiat as formatCurrency, formatDate } from "@/lib/utils";
import { InvoiceStatusPill } from "@/features/invoices/components/invoice-status-pill";
import { StatusActivityDot, type ActivityCategory } from "@/components/ui/status-activity-dot";
import { SearchInput } from "@/components/ui/search-input";
import { PROJECT_STATUS_BADGE, PROJECT_STATUS_LABEL } from "@/features/projects/constants/project-ui.constants";
import { TASK_STATUS_BADGE, TASK_STATUS_LABEL } from "@/features/tasks/constants/task-ui.constants";
import { CommunicationSkeleton } from "@/components/skeletons/page-skeletons";



type TabType = "ALL" | "PROJECT" | "TASK" | "INVOICE";

interface ConversationTarget {
  key: string;
  category: TabType;
  title: string;
  subtitle: string;
  parentName?: string;
  data: Project | Task | Invoice;
}

export default function CommunicationClient() {
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedKey, setSelectedKey] = React.useState<string>(searchParams.get("context") || "");
  const [draft, setDraft] = React.useState("");
  const [keyword, setKeyword] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<TabType>("ALL");
  const [uploadedUrls, setUploadedUrls] = React.useState<string[]>([]);
  const [blockedTargetKeys, setBlockedTargetKeys] = React.useState<Set<string>>(() => new Set());
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: projects, isLoading: isProjectLoading } = useProjectsQuery();
  const { data: tasks, isLoading: isTasksLoading } = useTasksQuery({});
  const { data: invoices, isLoading: isInvoiceLoading } = useInvoicesQuery({});

  const conversations = React.useMemo<ConversationTarget[]>(() => {
    const projectTitleById = new Map(
      (projects?.content ?? []).map((project: Project) => [project.id, project.title])
    );

    const projectItems = (projects?.content ?? []).map((project: Project) => ({
      key: `PROJECT_${project.id}`,
      category: "PROJECT" as const,
      title: project.title,
      subtitle: project.description || project.title,
      data: project,
    }));

    const taskItems = (tasks?.content ?? []).map((task: Task) => ({
      key: `TASK_${task.id}`,
      category: "TASK" as const,
      title: task.title,
      subtitle: task.projectTitle || task.title,
      parentName: task.projectTitle,
      data: task,
    }));

    const invoiceItems = (invoices ?? []).map((invoice: Invoice) => ({
      key: `INVOICE_${invoice.id}`,
      category: "INVOICE" as const,
      title: invoice.title,
      subtitle: projectTitleById.get(invoice.projectId) || invoice.projectId || invoice.title,
      parentName: projectTitleById.get(invoice.projectId) || invoice.projectId,
      data: invoice,
    }));

    return [...projectItems, ...taskItems, ...invoiceItems];
  }, [projects, tasks, invoices]);

  React.useEffect(() => {
    const urlContextType = (searchParams.get("type")?.toUpperCase() || "") as TabType | "";

    if (urlContextType && ["ALL", "PROJECT", "TASK", "INVOICE"].includes(urlContextType)) {
      setActiveCategory(urlContextType);
    }
  }, [searchParams]);

  React.useEffect(() => {
    if (!selectedKey && conversations.length > 0) {
      const firstAllowed = conversations.find((item) => !blockedTargetKeys.has(item.key));
      if (firstAllowed) {
        setSelectedKey(firstAllowed.key);
        const params = new URLSearchParams(searchParams.toString());
        params.set("context", firstAllowed.key);
        router.replace(`?${params.toString()}`, { scroll: false });
        return;
      }
    }

    if (selectedKey && !conversations.some((conversation) => conversation.key === selectedKey)) {
      setSelectedKey("");
    }
  }, [conversations, selectedKey, blockedTargetKeys, router, searchParams]);

  const selectConversation = React.useCallback((key: string) => {
    setSelectedKey(key);
    const params = new URLSearchParams(searchParams.toString());
    params.set("context", key);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const selectedConversation = React.useMemo(() => {
    return conversations.find((item) => item.key === selectedKey && !blockedTargetKeys.has(item.key)) ?? null;
  }, [conversations, selectedKey, blockedTargetKeys]);

  const commentsQueryArgs = React.useMemo(() => {
    if (!selectedConversation) return null;
    const targetType: CommentTargetType =
      selectedConversation.category === "PROJECT"
        ? "PROJECT"
        : selectedConversation.category === "TASK"
          ? "TASK"
          : "INVOICE";
    return {
      targetType,
      targetId: selectedConversation.data.id,
    };
  }, [selectedConversation]);

  const { data: comments = [], isLoading: isCommentsLoading, isError: isCommentsError, error } = useCommentsQuery(commentsQueryArgs?.targetType, commentsQueryArgs?.targetId);

  const postCommentMutation = usePostCommentMutation(commentsQueryArgs?.targetType, commentsQueryArgs?.targetId);
  const uploadAttachmentMutation = useUploadAttachmentMutation();
  const downloadAttachmentMutation = useDownloadAttachmentMutation();

  React.useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      const firstAllowed = conversations.find((item) => !blockedTargetKeys.has(item.key));
      if (firstAllowed) {
        setSelectedKey(firstAllowed.key);
      }
    }
  }, [conversations, selectedConversation, blockedTargetKeys]);

  const filteredConversations = React.useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return conversations.filter((item) => {
      if (activeCategory !== "ALL" && item.category !== activeCategory) return false;

      if (!normalizedKeyword) return true;
      const searchable = `${item.title} ${item.subtitle} ${item.category}`.toLowerCase();
      return searchable.includes(normalizedKeyword);
    });
  }, [conversations, keyword, activeCategory]);

  const messageListRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!messageListRef.current) return;
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [comments, selectedKey]);

  React.useEffect(() => {
    if (!isCommentsError || !selectedConversation) return;
    const status = (error as AxiosError | undefined)?.response?.status;
    if (status !== 403) return;
    setBlockedTargetKeys((current) => {
      if (current.has(selectedConversation.key)) return current;
      const next = new Set(current);
      next.add(selectedConversation.key);
      return next;
    });
  }, [error, isCommentsError, selectedConversation]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    let content = draft.trim();
    if (!content && uploadedUrls.length === 0) return;

    if (!content && uploadedUrls.length > 0) {
      content = "Shared an attachment";
    }

    postCommentMutation.mutate({ content, attachmentUrls: uploadedUrls }, {
      onSuccess: () => {
        setDraft("");
        setUploadedUrls([]);
      }
    });
  };

  const renderClockTime = (value?: string) => {
    if (!value) return "now";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "now";
    return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).format(date);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!commentsQueryArgs) return;
    const uploaded = await uploadAttachmentMutation.mutateAsync({
      file,
      targetType: commentsQueryArgs.targetType,
      targetId: commentsQueryArgs.targetId,
    });
    setUploadedUrls((current) => [...current, uploaded.fileUrl]);
    event.target.value = "";
  };

  if ((isProjectLoading || isTasksLoading || isInvoiceLoading) && conversations.length === 0) {
    return <CommunicationSkeleton />;
  }

  return (
    <div className="-m-4 grid h-[calc(100vh-64px)] grid-cols-1 gap-3 overflow-hidden bg-surface-base p-3 font-body text-content-secondary sm:-m-6 sm:gap-4 sm:p-4 lg:-m-8 lg:grid-cols-12 lg:gap-6 lg:p-6">
      <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 overflow-hidden">
        <div className="shrink-0 bg-surface/60 backdrop-blur-xl ring-1 ring-theme-border p-5 rounded-3xl shadow-2xl shadow-theme overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-status-web3-surface blur-2xl pointer-events-none rounded-full" />
          <h2 className="text-sm font-space-grotesk font-bold text-content-primary uppercase tracking-widest flex items-center gap-2 mb-4 relative z-10">
            <LayoutList className="w-4 h-4 text-theme-accent" />
            Conversations
          </h2>

          <div className="relative z-10 mb-4 flex gap-1 p-1 bg-surface-base/80 rounded-xl ring-1 ring-theme-border">
            {["ALL", "PROJECT", "TASK", "INVOICE"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as TabType)}
                className={cn(
                  "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg",
                  activeCategory === cat ? "bg-status-web3-surface text-status-web3-text ring-1 ring-status-web3-border" : "text-content-muted hover:bg-surface-sunken hover:text-content-secondary"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <SearchInput
            placeholder="Search..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="bg-surface-base/60 pl-9 py-2.5 text-xs focus:ring-status-web3-border"
            iconClassName="w-3.5 h-3.5"
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface/40 backdrop-blur-md ring-1 ring-theme-border rounded-3xl p-3 shadow-inner">
          {isProjectLoading || isInvoiceLoading || isTasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-surface-sunken animate-pulse rounded-2xl" />)}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center opacity-50 justify-center h-full space-y-3">
              <FolderOpen className="w-5 h-5 text-content-muted" />
              <p className="text-xs text-center text-content-muted">No contexts found.</p>
            </div>
          ) : (
            <div className="space-y-2 relative">
              <div className="absolute left-6 top-4 bottom-4 w-px bg-surface-sunken" />
              {filteredConversations.map((conv) => {
                const isActive = conv.key === selectedKey;
                const isProject = conv.category === "PROJECT";
                const isTask = conv.category === "TASK";
                return (
                  <button
                    key={conv.key}
                    onClick={() => selectConversation(conv.key)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all duration-300 relative group overflow-hidden z-10",
                      isActive
                        ? "bg-status-web3-surface ring-1 ring-status-web3-border shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                        : "hover:bg-surface-elevated/60 hover:ring-1 hover:ring-theme-border bg-surface/40 border border-transparent"
                    )}
                  >
                    <div className="shrink-0 relative">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-transform",
                        isActive ? "bg-status-web3-surface shadow-inner" : "bg-surface-elevated/80 shadow-[0_2px_8px_var(--shadow-color)]",
                        "group-hover:scale-110"
                      )}>
                        {isProject ? <FolderOpen className={cn("w-4 h-4", isActive ? "text-status-web3-text" : "text-theme-accent")} />
                          : isTask ? <Pin className={cn("w-4 h-4", isActive ? "text-status-web3-text" : "text-status-danger-text")} />
                          : <Receipt className={cn("w-4 h-4", isActive ? "text-status-web3-text" : "text-status-warning-text")} />}
                      </div>
                      {!isActive && (
                        <StatusActivityDot
                          category={conv.category === "ALL" ? "PROJECT" : (conv.category as ActivityCategory)}
                          status={conv.data.status}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-xs font-bold truncate tracking-wide transition-colors", isActive ? "text-content-primary" : "text-content-secondary group-hover:text-content-primary")}>
                        {conv.title}
                      </p>
                      <p className="text-[10px] text-content-muted truncate mt-0.5">{conv.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="col-span-1 lg:col-span-6 bg-surface/60 backdrop-blur-xl ring-1 ring-theme-border rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-status-web3-surface blur-[120px] pointer-events-none rounded-full" />

        <div className="p-5 lg:p-6 border-b border-theme-border flex items-center justify-between shrink-0 relative z-10 bg-surface-base/40">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-full bg-status-web3-surface border border-status-web3-border flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)] shrink-0">
              <MessageSquare className="w-4 h-4 text-status-web3-text animate-pulse" />
            </div>
            <div className="min-w-0 pr-4">
              <h2 className="text-lg lg:text-xl font-space-grotesk font-bold text-content-primary tracking-tight truncate">
                {selectedConversation?.title || "Command Thread"}
              </h2>
              <p className="text-xs font-medium text-content-secondary uppercase tracking-widest mt-0.5 truncate">
                {selectedConversation?.category || "Awaiting Context"} {selectedConversation?.category === "PROJECT" ? `• ${selectedConversation.subtitle}` : selectedConversation ? `• ${selectedConversation.parentName}` : ""}
              </p>
            </div>
          </div>
          {selectedConversation && (
            <div className="flex items-center justify-center bg-surface w-8 h-8 rounded-full ring-1 ring-theme-accent shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success-text opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-success-text" />
              </span>
            </div>
          )}
        </div>

        <div ref={messageListRef} className="flex-1 overflow-y-auto custom-scrollbar p-5 lg:p-6 space-y-6 relative z-10">
          {!selectedConversation ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <Sparkles className="w-12 h-12 text-content-muted mb-4" />
              <p className="text-sm text-content-muted font-space-grotesk font-bold uppercase tracking-widest">Select Context</p>
            </div>
          ) : isCommentsLoading ? (
            <div className="flex justify-center py-10">
              <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 rounded-full bg-status-web3-surface animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-status-web3-surface animate-bounce delay-75" />
                <div className="w-2 h-2 rounded-full bg-status-web3-surface animate-bounce delay-150" />
              </div>
            </div>
          ) : isCommentsError ? (
            <div className="bg-status-danger-surface border border-status-danger-border p-4 rounded-xl text-xs text-status-danger-text">
              Access denied or failed to load thread.
            </div>
          ) : comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-60">
              <div className="w-14 h-14 rounded-2xl bg-surface-elevated/40 flex items-center justify-center ring-1 ring-theme-border mb-4 shadow-xl">
                <Pin className="w-6 h-6 text-content-muted" />
              </div>
              <p className="text-content-secondary text-sm font-medium">No evidence pinned yet. Start the thread.</p>
            </div>
          ) : (
            comments.map((comment, index) => {
              const prev = comments[index - 1];
              const isOwn = comment.author?.id === user?.id;
              const isSameAuthorAsPrev = prev?.author?.id === comment.author?.id;
              const authorLabel = isOwn ? `You` : comment.author?.fullName || comment.author?.email || "Unknown";

              return (
                <div key={comment.id} className={cn("flex flex-col gap-1.5 max-w-[85%]", isOwn ? "ml-auto items-end" : "items-start", !isSameAuthorAsPrev ? "mt-6" : "mt-2")}>
                  {!isSameAuthorAsPrev && (
                    <div className="flex items-center gap-2 px-1 mb-1">
                      {!isOwn && <span className="text-[10px] font-bold text-content-secondary uppercase tracking-widest">{authorLabel}</span>}
                      <span className="text-[10px] text-content-muted font-mono tracking-tight">{renderClockTime(comment.createdAt)}</span>
                      {isOwn && <span className="text-[10px] font-bold text-status-web3-text uppercase tracking-widest">{authorLabel}</span>}
                    </div>
                  )}
                  <div className={cn(
                    "p-4 rounded-2xl shadow-xl backdrop-blur-sm",
                    isOwn
                      ? "bg-status-web3-surface border-t border-status-web3-border border-x border-status-web3-border border-b border-status-web3-border text-status-web3-text rounded-tr-sm shadow-[0_4px_20px_rgba(99,102,241,0.08)]"
                      : "bg-surface-elevated/80 border-t border-theme-border border-x border-theme-border border-b border-theme-border text-content-secondary rounded-tl-sm shadow-[0_4px_20px_var(--shadow-color)]"
                  )}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    {comment.attachmentUrls && comment.attachmentUrls.length > 0 && (
                      <div className="mt-3 flex flex-col gap-2">
                        {comment.attachmentUrls.map((url, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => downloadAttachmentMutation.mutate({ fileUrl: url })}
                            disabled={downloadAttachmentMutation.isPending}
                            className="flex w-full items-center gap-2 rounded border border-theme-border bg-surface-sunken/60 px-3 py-2 text-left text-xs transition hover:bg-surface-sunken disabled:opacity-50"
                          >
                            <Paperclip className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Protected attachment</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 lg:p-5 border-t border-theme-border bg-surface-base/80 relative z-10 shrink-0">
          {uploadedUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {uploadedUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-status-web3-surface text-status-web3-text rounded-lg text-xs ring-1 ring-status-web3-border">
                  <Paperclip className="w-3 h-3" />
                  <span className="max-w-[150px] truncate">{url.split('/').pop() || url}</span>
                  <button type="button" onClick={() => setUploadedUrls(urls => urls.filter((_, i) => i !== idx))} className="hover:text-content-primary rounded-full p-0.5"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
            <div className="flex flex-col gap-1 p-1 bg-surface/60 rounded-xl ring-1 ring-theme-border shadow-inner">
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative p-2.5 text-content-muted hover:text-content-primary hover:bg-surface-sunken rounded-lg transition-colors"
                disabled={uploadAttachmentMutation.isPending}
              >
                {uploadAttachmentMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-status-web3-border border-t-transparent rounded-full animate-spin flex items-center justify-center"></div>
                ) : (
                  <Paperclip className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex-1 bg-surface-base/80 backdrop-blur-md ring-1 ring-theme-border rounded-2xl overflow-hidden focus-within:ring-status-web3-border transition-all shadow-[inset_0_2px_10px_var(--shadow-color)] flex items-center pr-2">
              <textarea
                placeholder={selectedConversation ? "Transmit message or link evidence..." : "Awaiting context..."}
                className="w-full bg-transparent px-4 py-4 text-sm font-body text-content-secondary placeholder:text-content-muted outline-none resize-none custom-scrollbar min-h-[56px] max-h-32"
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
                }}
                disabled={!selectedConversation || postCommentMutation.isPending}
              />
              <button
                type="submit"
                disabled={!selectedConversation || (!draft.trim() && uploadedUrls.length === 0) || postCommentMutation.isPending}
                className="shrink-0 p-3.5 bg-action-primary hover:bg-action-primary-hover text-action-primary-foreground rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all disabled:opacity-50 disabled:shadow-none"
              >
                <Send className="w-4 h-4 translate-x-px -translate-y-px" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex lg:col-span-3 bg-surface/60 backdrop-blur-xl ring-1 ring-theme-border p-6 rounded-3xl shadow-2xl flex-col gap-6 overflow-y-auto custom-scrollbar relative">
        <div className="absolute top-0 left-0 w-32 h-32 bg-action-subtle blur-3xl pointer-events-none rounded-full" />

        {!selectedConversation ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-4">
            <Search className="w-8 h-8 text-content-muted" />
            <p className="text-[10px] text-content-muted uppercase tracking-widest font-bold font-space-grotesk">Metadata Unlinked</p>
          </div>
        ) : selectedConversation.category === "PROJECT" ? (
          <>
            {(() => {
              const project = selectedConversation.data as Project;
              return (
                <div className="pb-5 border-b border-theme-border relative z-10">
                  <p className="text-[10px] font-bold text-theme-accent uppercase tracking-widest mb-2 flex items-center gap-1.5 px-2.5 py-1 bg-action-subtle rounded-full w-fit ring-1 ring-theme-accent"><FolderOpen className="w-3 h-3" /> Project Evidence</p>
                  <h3 className="text-lg font-space-grotesk font-bold text-content-primary break-words max-w-full leading-tight">{project.title}</h3>
                  <p className="text-[11px] text-content-muted mt-2 font-mono">Project</p>
                  <div className="bg-surface-elevated/40 rounded-2xl p-4 ring-1 ring-theme-border flex flex-col hover:bg-surface-elevated/60 transition-colors cursor-default">
                    <p className="text-[10px] text-content-muted uppercase tracking-widest font-bold mb-2">Stage</p>
                    <span className={cn(
                      "text-xs font-bold px-3 py-1.5 rounded-lg w-fit ring-1 ring-inset shadow-inner",
                      PROJECT_STATUS_BADGE[project.status]
                    )}>
                      {PROJECT_STATUS_LABEL[project.status]}
                    </span>
                  </div>

                  <div className="bg-surface-elevated/40 rounded-2xl p-4 ring-1 ring-theme-border flex items-start gap-3 hover:bg-surface-elevated/60 transition-colors cursor-default">
                    <div className="p-2.5 bg-status-web3-surface rounded-xl text-status-web3-text shrink-0 ring-1 ring-status-web3-border"><CreditCard className="w-5 h-5" /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-content-muted uppercase tracking-widest font-bold mb-0.5">Total Budget</p>
                      <p className="text-xl font-space-grotesk font-bold text-content-secondary truncate">{formatCurrency(project.budget)}</p>
                    </div>
                  </div>

                  <div className="bg-surface-elevated/40 rounded-2xl p-4 ring-1 ring-theme-border flex items-start gap-3 hover:bg-surface-elevated/60 transition-colors cursor-default">
                    <div className="p-2.5 bg-status-danger-surface rounded-xl text-status-danger-text shrink-0 ring-1 ring-status-danger-border"><Clock className="w-5 h-5" /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-content-muted uppercase tracking-widest font-bold mb-0.5">Deadline</p>
                      <p className="text-sm font-medium text-content-secondary pt-1 tracking-wide">{formatDate(project.deadline)}</p>
                    </div>
                  </div>

                  <div className="bg-surface-elevated/40 rounded-2xl p-4 ring-1 ring-theme-border hover:bg-surface-elevated/60 transition-colors cursor-default">
                    <p className="text-[10px] text-content-muted uppercase tracking-widest font-bold mb-3 flex items-center gap-2">Assignee Core</p>
                    <div className="flex items-center gap-1 -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center font-bold text-[10px] ring-2 ring-theme-border text-status-web3-text shadow-md">FR</div>
                      <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center font-bold text-[10px] ring-2 ring-theme-border text-theme-accent shadow-md">CL</div>
                      <div className="w-8 h-8 rounded-full bg-surface-elevated/50 flex items-center justify-center p-1 border border-dashed border-theme-border text-content-muted hover:text-content-primary hover:border-theme-border transition-colors cursor-pointer"><User className="w-3.5 h-3.5" /></div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        ) : selectedConversation.category === "TASK" ? (
          <>
            {(() => {
              const task = selectedConversation.data as Task;
              return (
                <div className="pb-5 border-b border-theme-border relative z-10">
                  <p className="text-[10px] font-bold text-status-danger-text uppercase tracking-widest mb-2 flex items-center gap-1.5 px-2.5 py-1 bg-status-danger-surface rounded-full w-fit ring-1 ring-status-danger-border"><Pin className="w-3 h-3" /> Task Evidence</p>
                  <h3 className="text-lg font-space-grotesk font-bold text-content-primary break-words max-w-full leading-tight">{task.title}</h3>
                  <p className="text-[11px] text-content-muted mt-2 font-mono">Belongs to: {selectedConversation.parentName}</p>
                  <div className="bg-surface-elevated/40 rounded-2xl p-4 ring-1 ring-theme-border flex flex-col hover:bg-surface-elevated/60 transition-colors cursor-default">
                    <p className="text-[10px] text-content-muted uppercase tracking-widest font-bold mb-2">Task Status</p>
                    <span className={cn(
                      "text-xs font-bold px-3 py-1.5 rounded-lg w-fit ring-1 ring-inset shadow-inner",
                      TASK_STATUS_BADGE[task.status]
                    )}>
                      {TASK_STATUS_LABEL[task.status]}
                    </span>
                  </div>

                  <div className="bg-surface-elevated/40 rounded-2xl ring-1 ring-theme-border divide-y divide-theme-border">
                    <div className="flex justify-between items-center p-4">
                      <span className="text-[10px] font-bold text-content-muted uppercase tracking-widest">Priority</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-content-secondary">{task.priority}</span>
                    </div>
                    <div className="flex justify-between items-center p-4">
                      <span className="text-[10px] font-bold text-content-muted uppercase tracking-widest">Due Date</span>
                      <span className="text-sm font-medium text-content-secondary">{formatDate(task.dueDate)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          <>
            {(() => {
              const invoice = selectedConversation.data as Invoice;
              return (
                <div className="pb-5 border-b border-theme-border relative z-10">
                  <p className="text-[10px] font-bold text-status-warning-text uppercase tracking-widest mb-2 flex items-center gap-1.5 px-2.5 py-1 bg-status-warning-surface rounded-full w-fit ring-1 ring-status-warning-border"><Receipt className="w-3 h-3" /> Invoice Receipt</p>
                  <h3 className="text-lg font-space-grotesk font-bold text-content-primary max-w-full truncate leading-tight">{invoice.title}</h3>
                  <p className="text-[11px] text-content-muted mt-2 font-mono">Belongs to: {selectedConversation.parentName}</p>
                  <div className="bg-surface-elevated/40 rounded-2xl p-4 ring-1 ring-theme-border text-center py-6 shadow-inner">
                    <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest mb-2">Total Amount</p>
                    <span className="text-3xl font-space-grotesk tracking-tight text-content-primary font-bold">{formatCurrency(invoice.amount)}</span>
                  </div>

                  <div className="bg-surface-elevated/40 rounded-2xl ring-1 ring-theme-border divide-y divide-theme-border">
                    <div className="flex justify-between items-center p-4">
                      <span className="text-[10px] font-bold text-content-muted uppercase tracking-widest">Status</span>
                      <InvoiceStatusPill status={invoice.status} />
                    </div>
                    <div className="flex justify-between items-center p-4">
                      <span className="text-[10px] font-bold text-content-muted uppercase tracking-widest">Due Date</span>
                      <span className="text-sm text-content-secondary font-medium tracking-wide">{formatDate(invoice.dueDate)}</span>
                    </div>
                  </div>

                  <div className="bg-status-web3-surface ring-1 ring-status-web3-border rounded-2xl p-5 mt-6 text-center shadow-[inset_0_2px_15px_rgba(99,102,241,0.05)] border-t border-status-web3-border">
                    <Receipt className="w-7 h-7 text-status-web3-text/50 mx-auto mb-3" />
                    <p className="text-xs text-status-web3-text/60 font-medium leading-relaxed">
                      Conversations attached to invoices are for dispute resolution or payment proof evidence.
                    </p>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}
