"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCommentsQuery,
  usePostCommentMutation,
} from "@/features/communication/hooks/use-communication";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface TaskDiscussionProps {
  taskId: string;
}

function formatTime(dateString?: string) {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(dateString));
}

export function TaskDiscussion({ taskId }: TaskDiscussionProps) {
  const { user } = useAuthStore();
  const { data: comments = [], isLoading } = useCommentsQuery("TASK", taskId);
  const postComment = usePostCommentMutation("TASK", taskId);
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim() || postComment.isPending) return;

    postComment.mutate({ content: content.trim(), attachmentUrls: [] }, {
      onSuccess: () => {
        setContent("");
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full -m-6 relative">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-32"
      >
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-800 shrink-0" />
                <div className="space-y-2 flex-1 pt-1">
                  <div className="flex gap-2">
                    <div className="h-4 bg-slate-800 rounded w-24" />
                    <div className="h-4 bg-slate-800 rounded w-16" />
                  </div>
                  <div className="h-16 bg-slate-800 rounded-lg w-full max-w-md" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-slate-600" />
            </div>
            <div>
              <p className="font-medium text-slate-400">No discussion yet</p>
              <p className="text-sm mt-1 max-w-xs">
                Start a conversation about this task. The assignee or project owner will be notified.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => {
              const isMe = comment.author.id === user?.id;
              
              return (
                <div key={comment.id} className={cn("flex gap-4", isMe ? "flex-row-reverse" : "flex-row")}>
                  <div className="w-10 h-10 rounded-full bg-slate-800 shrink-0 flex items-center justify-center text-slate-400 font-bold uppercase border border-slate-700">
                    {comment.author.fullName?.charAt(0) || comment.author.email?.charAt(0) || "?"}
                  </div>
                  
                  <div className={cn("flex flex-col max-w-[80%]", isMe ? "items-end" : "items-start")}>
                    <div className="flex items-baseline gap-2 mb-1 px-1">
                      <span className="text-sm font-medium text-slate-300">
                        {isMe ? "You" : comment.author.fullName || comment.author.email}
                      </span>
                      {comment.author.role && (
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                          {comment.author.role}
                        </span>
                      )}
                      <span className="text-xs text-slate-600">
                        {formatTime(comment.createdAt)}
                      </span>
                    </div>
                    
                    <div className={cn(
                      "px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap break-words",
                      isMe 
                        ? "bg-emerald-600/20 text-emerald-50 rounded-tr-sm border border-emerald-500/20" 
                        : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700"
                    )}>
                      {comment.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#111827] border-t border-slate-800">
        <form 
          onSubmit={handleSubmit}
          className="flex items-end gap-3 max-w-full relative"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment... (Enter to send, Shift+Enter for newline)"
            className="flex-1 max-h-32 min-h-[44px] bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none custom-scrollbar"
            rows={1}
            style={{ 
              height: content.split("\n").length > 1 ? "auto" : "44px",
              minHeight: "44px" 
            }}
          />
          <button
            type="submit"
            disabled={!content.trim() || postComment.isPending}
            className="w-11 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 disabled:hover:bg-emerald-600 shadow-lg shadow-emerald-900/20"
          >
            {postComment.isPending ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            ) : (
              <Send className="w-5 h-5 ml-[-2px]" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
