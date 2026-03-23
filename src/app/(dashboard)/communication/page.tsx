"use client";

import * as React from "react";
import type { AxiosError } from "axios";
import { ImageIcon, MessageSquare, Paperclip, Pin, Search, Send, User, FolderOpen, Receipt, Sparkles } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useInvoicesQuery } from "@/features/invoices/hooks/use-invoices";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects";
import { useCommentsQuery, usePostCommentMutation } from "@/features/communication/hooks/use-communication";
import type { CommentTargetType } from "@/features/communication/types/comment.types";
import { cn } from "@/lib/utils";

interface ConversationTarget {
  key: string;
  targetType: CommentTargetType;
  targetId: string;
  title: string;
  subtitle: string;
  category: "PROJECT" | "INVOICE";
}

export default function CommunicationHub() {
  const { user } = useAuthStore();
  const [keyword, setKeyword] = React.useState("");
  const [draft, setDraft] = React.useState("");
  const [blockedTargetKeys, setBlockedTargetKeys] = React.useState<Set<string>>(new Set());

  const { data: projectsPage, isLoading: isProjectLoading } = useProjectsQuery(0, 12);
  const { data: invoices = [], isLoading: isInvoiceLoading } = useInvoicesQuery({});

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
      subtitle: project.ownerName || project.ownerEmail || "Project conversation",
      category: "PROJECT" as const,
    }));

    const invoiceTargets = scopedInvoices.slice(0, 12).map((invoice) => ({
      key: `INVOICE:${invoice.id}`,
      targetType: "INVOICE" as const,
      targetId: invoice.id,
      title: invoice.title,
      subtitle: `#${invoice.id} • ${invoice.paymentMethod}`,
      category: "INVOICE" as const,
    }));

    return [...projectTargets, ...invoiceTargets].filter((target) => !blockedTargetKeys.has(target.key));
  }, [blockedTargetKeys, projectsPage?.content, scopedInvoices]);

  const [selectedKey, setSelectedKey] = React.useState<string>("");

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
    }
  }, [conversations, selectedKey]);

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

  const filteredConversations = React.useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return conversations;

    return conversations.filter((item) => {
      const searchable = `${item.title} ${item.subtitle} ${item.category}`.toLowerCase();
      return searchable.includes(normalizedKeyword);
    });
  }, [conversations, keyword]);

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
    const content = draft.trim();
    if (!content) return;

    postCommentMutation.mutate(content, {
      onSuccess: () => setDraft(""),
    });
  };

  const renderClockTime = (value?: string) => {
    if (!value) return "now";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "now";
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  return (
    <div className="flex flex-col xl:flex-row h-[calc(100vh-64px)] -m-8 overflow-hidden bg-[#0A0E17] font-body text-slate-200">
      
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <header className="px-5 lg:px-8 py-6 lg:py-8 shrink-0 relative">
          <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />
          <h1 className="text-3xl font-headline font-bold text-white tracking-tight flex items-center gap-3">
            Workspace Contexts
            <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider font-body">Global Hub</span>
          </h1>
          <p className="text-slate-400 mt-2 font-body max-w-xl leading-relaxed text-sm">
            Select an active project or open invoice context below to access its dedicated communication thread and milestone discussions.
          </p>
          
          <div className="mt-8 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search contexts..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:bg-white/10 transition-all font-body"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 lg:px-8 pb-6 lg:pb-8 custom-scrollbar relative z-10">
          {isProjectLoading || isInvoiceLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 bg-white/5 border border-white/5 animate-pulse rounded-2xl" />
                ))}
             </div>
          ) : filteredConversations.length === 0 ? (
             <div className="p-12 text-center text-slate-500 bg-white/5 border border-white/10 border-dashed rounded-2xl font-body">
                No conversation targets found.
             </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {filteredConversations.map((conversation) => {
                const isActive = conversation.key === selectedKey;
                const isProject = conversation.category === "PROJECT";
                
                return (
                  <button
                    key={conversation.key}
                    type="button"
                    onClick={() => setSelectedKey(conversation.key)}
                    className={cn(
                      "group text-left p-6 rounded-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[160px]",
                      isActive
                        ? "bg-indigo-500/10 border border-indigo-500/30 scale-[1.02] shadow-[0_0_30px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20 cursor-default"
                        : "bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] hover:border-white/20 active:scale-[0.98] cursor-pointer"
                    )}
                  >
                    {isActive && (
                      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
                    )}

                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <span className={cn(
                        "px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                        isProject ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                      )}>
                        {isProject ? <FolderOpen className="w-3 h-3" /> : <Receipt className="w-3 h-3" />}
                        {conversation.category}
                      </span>
                      {isActive && <MessageSquare className="w-4 h-4 text-indigo-400 animate-pulse" />}
                    </div>
                    
                    <div className="relative z-10">
                       <h3 className="text-lg font-headline font-semibold text-white mb-1.5 truncate pr-4">
                         {conversation.title}
                       </h3>
                       <p className="text-sm text-slate-400 font-body truncate">
                         {conversation.subtitle}
                       </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <aside className="w-full xl:w-96 h-[46vh] xl:h-auto shrink-0 bg-[#0b0f1a]/80 backdrop-blur-2xl border-t xl:border-t-0 xl:border-l border-white/5 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.4)] relative z-20">
        <div className="p-6 border-b border-white/5 bg-[#0b0f1a]/90 shrink-0">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-headline font-bold text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              Contextual Thread
            </h2>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
          
          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 flex items-start gap-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 blur-xl rounded-full" />
             <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center relative z-10 shadow-lg">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full z-20"></span>
             </div>
             <div className="flex-1 min-w-0 pr-2">
               <div className="flex justify-between items-center mb-0.5">
                  <p className="text-sm font-bold text-white font-headline truncate">
                    {selectedConversation?.title || "No Selection"}
                  </p>
               </div>
               <p className="text-xs text-slate-400 font-medium truncate">
                  {selectedConversation?.subtitle || "Select a context to begin"}
               </p>
             </div>
          </div>
        </div>

        <div ref={messageListRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
           {!selectedConversation ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                 <Sparkles className="w-12 h-12 text-slate-600 mb-4" />
                 <p className="text-sm text-slate-500 font-headline font-bold uppercase tracking-widest">Awaiting Context</p>
              </div>
           ) : isCommentsLoading ? (
             <div className="flex justify-center py-10">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 animate-pulse">Decrypting thread...</span>
             </div>
           ) : isCommentsError ? (
             <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-xs text-rose-400 font-body">
                Failed to attach to the context channel.
             </div>
           ) : comments.length === 0 ? (
             <div className="h-full flex items-center justify-center">
               <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center space-y-3">
                 <div className="mx-auto w-10 h-10 rounded-full border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center">
                   <MessageSquare className="w-5 h-5 text-indigo-400" />
                 </div>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest font-headline">New Thread</p>
                 <p className="text-sm text-slate-300 font-body">No messages yet. Send the first message to start this context thread.</p>
               </div>
             </div>
           ) : (
             <>
               <div className="flex items-center gap-4 mb-8">
                 <div className="h-px flex-1 bg-white/5" />
                 <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest font-headline">Today</span>
                 <div className="h-px flex-1 bg-white/5" />
               </div>
               
               {comments.map((comment) => {
                 const isOwnMessage = comment.author?.id === user?.id;
                 const authorLabel = isOwnMessage ? `You (${comment.author?.fullName || comment.author?.email || "User"})` : comment.author?.fullName || comment.author?.email || "Unknown";
                 
                 return (
                   <div key={comment.id} className={cn("space-y-2 flex flex-col", isOwnMessage ? "items-end" : "items-start")}>
                     <div className="flex items-center gap-2">
                       {!isOwnMessage && <span className="text-xs font-bold text-emerald-400 font-headline">{authorLabel}</span>}
                       <span className="text-[10px] text-slate-600 font-medium font-body">{renderClockTime(comment.createdAt)}</span>
                       {isOwnMessage && <span className="text-xs font-bold text-indigo-400 font-headline">{authorLabel}</span>}
                     </div>
                     
                     <div className={cn(
                       "relative max-w-[90%] p-4 rounded-xl backdrop-blur-sm",
                       isOwnMessage 
                         ? "bg-indigo-600/20 border border-indigo-500/30 rounded-tr-none text-indigo-50" 
                         : "bg-white/[0.03] border border-white/10 rounded-tl-none text-slate-200"
                     )}>
                       <p className="text-sm leading-relaxed font-body">{comment.content}</p>
                     </div>
                   </div>
                 );
               })}
             </>
           )}
        </div>

        <div className="p-6 border-t border-white/5 bg-[#0b0f1a]/95 shrink-0 z-10">
          <div className="flex items-center gap-2 mb-3">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors">
              <ImageIcon className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-500/10 text-indigo-400 transition-colors">
              <Pin className="w-4 h-4" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              placeholder={selectedConversation ? "Type a message or drop an evidence pin..." : "Awaiting context..."}
              className="w-full bg-[#05070A] border border-white/10 rounded-xl px-4 py-3 pr-14 text-sm text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px] max-h-36 resize-none custom-scrollbar font-body"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={!selectedConversation || postCommentMutation.isPending}
            />
            <button
              type="submit"
              disabled={!selectedConversation || !draft.trim() || postCommentMutation.isPending}
              className="absolute bottom-3 right-3 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-all shadow-lg active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </aside>
    </div>
  );
}
