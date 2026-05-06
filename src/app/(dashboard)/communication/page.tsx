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
import { useCommentsQuery, usePostCommentMutation, useUploadAttachmentMutation } from "@/features/communication/hooks/use-communication";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import type { CommentTargetType } from "@/features/communication/types/comment.types";
import type { Project } from "@/features/projects/types/project.types";
import type { Task } from "@/features/tasks/types/task.types";
import { cn } from "@/lib/utils";
import { InvoiceStatusPill } from "@/features/invoices/components/invoice-status-pill";
import { ProjectStatus } from "@/features/projects/types/project.types";
import { TaskStatus } from "@/features/tasks/types/task.types";

function formatCurrency(value: string | number | null | undefined): string {
  if (value == null) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
}

function formatDate(val: string | null | undefined) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function shouldShowActivityDot(target: ConversationTarget): boolean {
  if (target.category === "PROJECT") return target.data.status === "IN_PROGRESS";
  if (target.category === "TASK") return target.data.status === "IN_PROGRESS";
  if (target.category === "INVOICE") {
    return ["SENT", "OVERDUE", "PAID"].includes(target.data.status);
  }
  return false;
}

function getInvoiceActivityDotClass(status: Invoice["status"]): string {
  switch (status) {
    case "PAID":
      return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]";
    case "OVERDUE":
      return "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]";
    case "SENT":
      return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]";
    default:
      return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]";
  }
}

interface ProjectConversationTarget {
  key: string;
  targetType: CommentTargetType;
  targetId: string;
  title: string;
  subtitle: string;
  parentName: string;
  category: "PROJECT";
  data: Project;
}

interface InvoiceConversationTarget {
  key: string;
  targetType: CommentTargetType;
  targetId: string;
  title: string;
  subtitle: string;
  parentName: string;
  category: "INVOICE";
  data: Invoice;
}

interface TaskConversationTarget {
  key: string;
  targetType: CommentTargetType;
  targetId: string;
  title: string;
  subtitle: string;
  parentName: string;
  category: "TASK";
  data: Task;
}

type ConversationTarget = ProjectConversationTarget | InvoiceConversationTarget | TaskConversationTarget;
type TabType = "ALL" | "PROJECT" | "TASK" | "INVOICE";

export default function CommunicationHub() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialKey = searchParams.get("context") || "";

  const { user } = useAuthStore();
  const [keyword, setKeyword] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<TabType>("ALL");
  const [draft, setDraft] = React.useState("");
  const [uploadedUrls, setUploadedUrls] = React.useState<string[]>([]);
  const [blockedTargetKeys, setBlockedTargetKeys] = React.useState<Set<string>>(new Set());
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: projectsPage, isLoading: isProjectLoading } = useProjectsQuery(0, 12);
  const { data: invoices = [], isLoading: isInvoiceLoading } = useInvoicesQuery({});
  const { data: tasksPage, isLoading: isTasksLoading } = useTasksQuery({ page: 0, size: 20 });

  const scopedInvoices = React.useMemo(() => {
    if (!user) return [];
    if (user.role === "ADMIN") return invoices;
    return invoices.filter((invoice) => {
      if (user.role === "CLIENT") return invoice.clientId === user.id;
      if (user.role === "FREELANCER") return invoice.freelancerId === user.id;
      return false;
    });
  }, [invoices, user]);

  const conversations = React.useMemo<ConversationTarget[]>(() => {
    const projectTargets = (projectsPage?.content ?? []).map((project) => ({
      key: `PROJECT:${project.id}`,
      targetType: "PROJECT" as const,
      targetId: project.id,
      title: project.title,
      subtitle: project.ownerName || project.ownerEmail || "Project",
      parentName: "Project",
      category: "PROJECT" as const,
      data: project,
    }));

    const taskTargets = (tasksPage?.content ?? []).map((task) => ({
      key: `TASK:${task.id}`,
      targetType: "TASK" as const,
      targetId: task.id,
      title: task.title,
      subtitle: `${task.projectTitle} • ${task.status}`,
      parentName: task.projectTitle || "Task",
      category: "TASK" as const,
      data: task,
    }));

    const invoiceTargets = scopedInvoices.slice(0, 12).map((invoice) => {
      const parentProject = projectsPage?.content?.find((p) => p.id === invoice.projectId);
      return {
        key: `INVOICE:${invoice.id}`,
        targetType: "INVOICE" as const,
        targetId: invoice.id,
        title: invoice.title,
        subtitle: `#${invoice.id} • ${invoice.paymentMethod}`,
        parentName: parentProject?.title || "Invoice",
        category: "INVOICE" as const,
        data: invoice,
      };
    });

    return [...projectTargets, ...taskTargets, ...invoiceTargets].filter((target) => !blockedTargetKeys.has(target.key));
  }, [blockedTargetKeys, projectsPage?.content, tasksPage?.content, scopedInvoices]);

  const [selectedKey, setSelectedKey] = React.useState<string>(initialKey);

  React.useEffect(() => {
    if (!selectedKey && conversations.length > 0) {
      setSelectedKey(conversations[0].key);
    }
  }, [conversations, selectedKey]);

  React.useEffect(() => {
    if (!selectedKey) return;
    const stillVisible = conversations.some((item) => item.key === selectedKey);
    if (!stillVisible) {
      setSelectedKey(conversations[0]?.key ?? "");
    } else {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get("context") !== selectedKey) {
        params.set("context", selectedKey);
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    }
  }, [conversations, selectedKey, router, searchParams]);

  const selectedConversation = React.useMemo(
    () => conversations.find((item) => item.key === selectedKey),
    [conversations, selectedKey],
  );

  const { data: comments = [], isLoading: isCommentsLoading, isError: isCommentsError, error } = useCommentsQuery(
    selectedConversation?.targetType,
    selectedConversation?.targetId,
  );
  
  const postCommentMutation = usePostCommentMutation(
    selectedConversation?.targetType,
    selectedConversation?.targetId,
  );

  const uploadAttachmentMutation = useUploadAttachmentMutation();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAttachmentMutation.mutate(file, {
      onSuccess: (data) => {
        setUploadedUrls(prev => [...prev, data.fileUrl]);
      }
    });
    // clear input
    e.target.value = "";
  };

  const filteredConversations = React.useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    
    return conversations.filter((item) => {
      // Tab filter
      if (activeCategory !== "ALL" && item.category !== activeCategory) return false;
      // Keyword filter
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-64px)] -m-8 p-6 bg-[#0A0E17] font-body text-slate-200 overflow-hidden">
      
      {/* ── 1. Compact Context Dock (Cols 1-3) ── */}
      <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 overflow-hidden">
        <div className="shrink-0 bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 p-5 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl pointer-events-none rounded-full" />
          <h2 className="text-sm font-space-grotesk font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-4 relative z-10">
            <LayoutList className="w-4 h-4 text-emerald-400" />
            Conversations
          </h2>
          
          <div className="relative z-10 mb-4 flex gap-1 p-1 bg-slate-950/80 rounded-xl ring-1 ring-white/5">
            {["ALL", "PROJECT", "TASK", "INVOICE"].map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat as TabType)}
                className={cn(
                  "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg",
                  activeCategory === cat ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative z-10">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-body"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900/40 backdrop-blur-md ring-1 ring-white/5 rounded-3xl p-3 shadow-inner">
          {isProjectLoading || isInvoiceLoading || isTasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-white/5 animate-pulse rounded-2xl" />)}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center opacity-50 justify-center h-full space-y-3">
              <FolderOpen className="w-5 h-5 text-slate-500" />
              <p className="text-xs text-center text-slate-500">No contexts found.</p>
            </div>
          ) : (
            <div className="space-y-2 relative">
              <div className="absolute left-6 top-4 bottom-4 w-px bg-white/5" />
              {filteredConversations.map((conv) => {
                const isActive = conv.key === selectedKey;
                const isProject = conv.category === "PROJECT";
                const isTask = conv.category === "TASK";
                return (
                  <button
                    key={conv.key}
                    onClick={() => setSelectedKey(conv.key)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all duration-300 relative group overflow-hidden z-10",
                      isActive 
                        ? "bg-indigo-500/10 ring-1 ring-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
                        : "hover:bg-slate-800/60 hover:ring-1 hover:ring-white/10 bg-slate-900/40 border border-transparent"
                    )}
                  >
                    <div className="shrink-0 relative">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-transform",
                        isActive ? "bg-indigo-500/20 shadow-inner" : "bg-slate-800/80 shadow-[0_2px_8px_rgba(0,0,0,0.5)]",
                        "group-hover:scale-110"
                      )}>
                        {isProject ? <FolderOpen className={cn("w-4 h-4", isActive ? "text-indigo-400" : "text-emerald-400")} /> 
                                   : isTask ? <Pin className={cn("w-4 h-4", isActive ? "text-indigo-400" : "text-rose-400")} />
                                   : <Receipt className={cn("w-4 h-4", isActive ? "text-indigo-400" : "text-amber-400")} />}
                      </div>
                      {shouldShowActivityDot(conv) && !isActive && (
                        <span
                          className={cn(
                            "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#0A0E17]",
                            conv.category === "INVOICE"
                              ? getInvoiceActivityDotClass(conv.data.status)
                              : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
                          )}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-xs font-bold truncate tracking-wide transition-colors", isActive ? "text-white" : "text-slate-300 group-hover:text-white")}>
                        {conv.title}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{conv.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── 2. The Command Thread (Cols 4-8) ── */}
      <div className="col-span-1 lg:col-span-6 bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="p-5 lg:p-6 border-b border-white/5 flex items-center justify-between shrink-0 relative z-10 bg-slate-950/40">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)] shrink-0">
              <MessageSquare className="w-4 h-4 text-indigo-400 animate-pulse" />
            </div>
            <div className="min-w-0 pr-4">
              <h2 className="text-lg lg:text-xl font-space-grotesk font-bold text-white tracking-tight truncate">
                {selectedConversation?.title || "Command Thread"}
              </h2>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-0.5 truncate">
                  {selectedConversation?.category || "Awaiting Context"} {selectedConversation?.category === "PROJECT" ? `• ${selectedConversation.subtitle}` : selectedConversation ? `• ${selectedConversation.parentName}` : ""}
              </p>
            </div>
          </div>
          {selectedConversation && (
            <div className="flex items-center justify-center bg-slate-900 w-8 h-8 rounded-full ring-1 ring-emerald-500/30 shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
            </div>
          )}
        </div>

        <div ref={messageListRef} className="flex-1 overflow-y-auto custom-scrollbar p-5 lg:p-6 space-y-6 relative z-10">
          {!selectedConversation ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <Sparkles className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-sm text-slate-500 font-space-grotesk font-bold uppercase tracking-widest">Select Context</p>
            </div>
          ) : isCommentsLoading ? (
            <div className="flex justify-center py-10">
              <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 rounded-full bg-indigo-500/50 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-500/50 animate-bounce delay-75" />
                <div className="w-2 h-2 rounded-full bg-indigo-500/50 animate-bounce delay-150" />
              </div>
            </div>
          ) : isCommentsError ? (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-xs text-rose-400">
              Access denied or failed to load thread.
            </div>
          ) : comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-60">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/40 flex items-center justify-center ring-1 ring-white/5 mb-4 shadow-xl">
                  <Pin className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-slate-400 text-sm font-medium">No evidence pinned yet. Start the thread.</p>
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
                      {!isOwn && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{authorLabel}</span>}
                      <span className="text-[10px] text-slate-600 font-mono tracking-tight">{renderClockTime(comment.createdAt)}</span>
                      {isOwn && <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{authorLabel}</span>}
                    </div>
                  )}
                  <div className={cn(
                    "p-4 rounded-2xl shadow-xl backdrop-blur-sm",
                    isOwn 
                      ? "bg-indigo-600/20 border-t border-indigo-500/40 border-x border-indigo-500/10 border-b border-indigo-500/10 text-indigo-50 rounded-tr-sm shadow-[0_4px_20px_rgba(99,102,241,0.08)]" 
                      : "bg-slate-800/80 border-t border-white/10 border-x border-white/5 border-b border-white/5 text-slate-200 rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
                  )}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    {/* Render attachments if any */}
                    {comment.attachmentUrls && comment.attachmentUrls.length > 0 && (
                      <div className="mt-3 flex flex-col gap-2">
                        {comment.attachmentUrls.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-black/20 rounded border border-white/5 hover:bg-black/30 transition text-xs truncate max-w-full">
                            <Paperclip className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{url.split('/').pop() || url}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 lg:p-5 border-t border-white/5 bg-slate-950/80 relative z-10 shrink-0">
          {/* Uploaded Files Preview */}
          {uploadedUrls.length > 0 && (
             <div className="flex flex-wrap gap-2 mb-3">
               {uploadedUrls.map((url, idx) => (
                 <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 text-indigo-200 rounded-lg text-xs ring-1 ring-indigo-500/40">
                   <Paperclip className="w-3 h-3" />
                   <span className="max-w-[150px] truncate">{url.split('/').pop() || url}</span>
                   <button type="button" onClick={() => setUploadedUrls(urls => urls.filter((_, i) => i !== idx))} className="hover:text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                 </div>
               ))}
             </div>
          )}

            <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
            <div className="flex flex-col gap-1 p-1 bg-slate-900/60 rounded-xl ring-1 ring-white/5 shadow-inner">
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              <button 
                 type="button" 
                 onClick={() => fileInputRef.current?.click()}
                 className="relative p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                 disabled={uploadAttachmentMutation.isPending}
              >
                 {uploadAttachmentMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex items-center justify-center"></div>
                 ) : (
                    <Paperclip className="w-4 h-4" />
                 )}
              </button>
            </div>
            <div className="flex-1 bg-[#0A0E17]/80 backdrop-blur-md ring-1 ring-white/10 rounded-2xl overflow-hidden focus-within:ring-indigo-500/50 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] flex items-center pr-2">
              <textarea
                placeholder={selectedConversation ? "Transmit message or link evidence..." : "Awaiting context..."}
                className="w-full bg-transparent px-4 py-4 text-sm font-body text-slate-200 placeholder:text-slate-600 outline-none resize-none custom-scrollbar min-h-[56px] max-h-32"
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
                className="shrink-0 p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all disabled:opacity-50 disabled:shadow-none"
              >
                <Send className="w-4 h-4 translate-x-px -translate-y-px" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── 3. Evidence Metadata Pane (Cols 9-12) ── */}
      <div className="hidden lg:flex lg:col-span-3 bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 p-6 rounded-3xl shadow-2xl flex-col gap-6 overflow-y-auto custom-scrollbar relative">
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
        
        {!selectedConversation ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-4">
            <Search className="w-8 h-8 text-slate-600" />
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-space-grotesk">Metadata Unlinked</p>
          </div>
        ) : selectedConversation.category === "PROJECT" ? (
          <>
            <div className="pb-5 border-b border-white/5 relative z-10">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 rounded-full w-fit ring-1 ring-emerald-500/20"><FolderOpen className="w-3 h-3" /> Project Evidence</p>
              <h3 className="text-lg font-space-grotesk font-bold text-white break-words max-w-full leading-tight">{selectedConversation.data.title}</h3>
                <p className="text-[11px] text-slate-500 mt-2 font-mono">Project</p>
              <div className="bg-slate-800/40 rounded-2xl p-4 ring-1 ring-white/5 flex flex-col hover:bg-slate-800/60 transition-colors cursor-default">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Stage</p>
                  <span className={cn(
                    "text-xs font-bold px-3 py-1.5 rounded-lg w-fit ring-1 ring-inset shadow-inner",
                    selectedConversation.data.status === ProjectStatus.IN_PROGRESS ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20 shadow-emerald-500/10" :
                    selectedConversation.data.status === ProjectStatus.ON_HOLD ? "bg-amber-500/10 text-amber-400 ring-amber-500/20 shadow-amber-500/10" :
                    "bg-slate-700/50 text-slate-300 ring-slate-600/50 shadow-black/20"
                  )}>{selectedConversation.data.status}</span>
              </div>

              <div className="bg-slate-800/40 rounded-2xl p-4 ring-1 ring-white/5 flex items-start gap-3 hover:bg-slate-800/60 transition-colors cursor-default">
                 <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0 ring-1 ring-indigo-500/20"><CreditCard className="w-5 h-5" /></div>
                 <div className="min-w-0">
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Total Budget</p>
                   <p className="text-xl font-space-grotesk font-bold text-slate-200 truncate">{formatCurrency(selectedConversation.data.budget)}</p>
                 </div>
              </div>

              <div className="bg-slate-800/40 rounded-2xl p-4 ring-1 ring-white/5 flex items-start gap-3 hover:bg-slate-800/60 transition-colors cursor-default">
                 <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400 shrink-0 ring-1 ring-rose-500/20"><Clock className="w-5 h-5" /></div>
                 <div className="min-w-0">
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Deadline</p>
                   <p className="text-sm font-medium text-slate-300 pt-1 tracking-wide">{formatDate(selectedConversation.data.deadline)}</p>
                 </div>
              </div>
              
              <div className="bg-slate-800/40 rounded-2xl p-4 ring-1 ring-white/5 hover:bg-slate-800/60 transition-colors cursor-default">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">Assignee Core</p>
                <div className="flex items-center gap-1 -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-bold text-[10px] ring-2 ring-slate-800 text-indigo-300 shadow-md">FR</div>
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-bold text-[10px] ring-2 ring-slate-800 text-emerald-300 shadow-md">CL</div>
                  <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center p-1 border border-dashed border-slate-600 text-slate-500 hover:text-white hover:border-white/20 transition-colors cursor-pointer"><User className="w-3.5 h-3.5" /></div>
                </div>
              </div>
            </div>
          </>
        ) : selectedConversation.category === "TASK" ? (
          <>
            <div className="pb-5 border-b border-white/5 relative z-10">
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 rounded-full w-fit ring-1 ring-rose-500/20"><Pin className="w-3 h-3" /> Task Evidence</p>
              <h3 className="text-lg font-space-grotesk font-bold text-white break-words max-w-full leading-tight">{selectedConversation.data.title}</h3>
                <p className="text-[11px] text-slate-500 mt-2 font-mono">Belongs to: {selectedConversation.parentName}</p>
              <div className="bg-slate-800/40 rounded-2xl p-4 ring-1 ring-white/5 flex flex-col hover:bg-slate-800/60 transition-colors cursor-default">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Task Status</p>
                  <span className={cn(
                    "text-xs font-bold px-3 py-1.5 rounded-lg w-fit ring-1 ring-inset shadow-inner",
                    selectedConversation.data.status === TaskStatus.TODO ? "bg-slate-500/10 text-slate-400 ring-slate-500/20 shadow-slate-500/10" :
                    selectedConversation.data.status === TaskStatus.IN_PROGRESS ? "bg-amber-500/10 text-amber-400 ring-amber-500/20 shadow-amber-500/10" :
                      selectedConversation.data.status === TaskStatus.DONE ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20 shadow-emerald-500/10" :
                      "bg-rose-500/10 text-rose-400 ring-rose-500/20 shadow-rose-500/10"
                  )}>{selectedConversation.data.status}</span>
              </div>

              <div className="bg-slate-800/40 rounded-2xl ring-1 ring-white/5 divide-y divide-white/5">
                 <div className="flex justify-between items-center p-4">
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority</span>
                   <span className="text-xs font-bold uppercase tracking-widest text-slate-300">{selectedConversation.data.priority}</span>
                 </div>
                 <div className="flex justify-between items-center p-4">
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Due Date</span>
                   <span className="text-sm font-medium text-slate-300">{formatDate(selectedConversation.data.dueDate)}</span>
                 </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="pb-5 border-b border-white/5 relative z-10">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 rounded-full w-fit ring-1 ring-amber-500/20"><Receipt className="w-3 h-3" /> Invoice Receipt</p>
              <h3 className="text-lg font-space-grotesk font-bold text-white max-w-full truncate leading-tight">{selectedConversation.data.title}</h3>
                <p className="text-[11px] text-slate-500 mt-2 font-mono">Belongs to: {selectedConversation.parentName}</p>
               <div className="bg-slate-800/40 rounded-2xl p-4 ring-1 ring-white/5 text-center py-6 shadow-inner">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Amount</p>
                 <span className="text-3xl font-space-grotesk tracking-tight text-white font-bold">{formatCurrency(selectedConversation.data.amount)}</span>
               </div>
               
               <div className="bg-slate-800/40 rounded-2xl ring-1 ring-white/5 divide-y divide-white/5">
                 <div className="flex justify-between items-center p-4">
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</span>
                   <InvoiceStatusPill status={selectedConversation.data.status} />
                 </div>
                 <div className="flex justify-between items-center p-4">
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Due Date</span>
                   <span className="text-sm text-slate-300 font-medium tracking-wide">{formatDate(selectedConversation.data.dueDate)}</span>
                 </div>
               </div>

               <div className="bg-indigo-500/5 ring-1 ring-indigo-500/20 rounded-2xl p-5 mt-6 text-center shadow-[inset_0_2px_15px_rgba(99,102,241,0.05)] border-t border-indigo-500/20">
                 <Receipt className="w-7 h-7 text-indigo-400/50 mx-auto mb-3" />
                 <p className="text-xs text-indigo-200/60 font-medium leading-relaxed">
                   Conversations attached to invoices are for dispute resolution or payment proof evidence.
                 </p>
               </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}