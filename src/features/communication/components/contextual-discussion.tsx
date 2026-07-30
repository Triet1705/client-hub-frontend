"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, MessageSquare, Paperclip, Send, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  useCommentsQuery,
  useDownloadAttachmentMutation,
  usePostCommentMutation,
  useUploadAttachmentMutation,
} from "@/features/communication/hooks/use-communication";
import type { CommentTargetType } from "@/features/communication/types/comment.types";
import { projectKeys } from "@/features/projects/hooks/use-projects";

interface ContextualDiscussionProps {
  targetType: CommentTargetType;
  targetId: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
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

function fileNameFromUrl(url: string) {
  if (/^\/api\/attachments\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(url)) {
    return "Protected attachment";
  }
  return decodeURIComponent(url.split("?")[0]?.split("/").pop() || url);
}

export function ContextualDiscussion({
  targetType,
  targetId,
  emptyTitle = "No discussion yet",
  emptyDescription = "Start a conversation with the people working on this item.",
  className,
}: ContextualDiscussionProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: comments = [], isLoading } = useCommentsQuery(targetType, targetId);
  const postComment = usePostCommentMutation(targetType, targetId);
  const uploadAttachment = useUploadAttachmentMutation();
  const downloadAttachment = useDownloadAttachmentMutation();
  const [content, setContent] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const invalidateProjectPortalQueries = () => {
    if (targetType !== "PROJECT") return;
    queryClient.invalidateQueries({ queryKey: projectKeys.files(targetId) });
    queryClient.invalidateQueries({ queryKey: projectKeys.activity(targetId) });
  };

  const handleSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    if ((!content.trim() && uploadedUrls.length === 0) || postComment.isPending) return;

    postComment.mutate(
      {
        content: content.trim() || "Shared an attachment",
        attachmentUrls: uploadedUrls,
      },
      {
        onSuccess: () => {
          setContent("");
          setUploadedUrls([]);
          invalidateProjectPortalQueries();
        },
      },
    );
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploaded = await uploadAttachment.mutateAsync({ file, targetType, targetId });
    setUploadedUrls((current) => [...current, uploaded.fileUrl]);
    event.target.value = "";
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn("relative flex h-full min-h-[32rem] flex-col overflow-hidden bg-surface/60", className)}>
      <div ref={scrollRef} className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-6 pb-32">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map((item) => (
              <div key={item} className="flex gap-4 animate-pulse">
                <div className="h-10 w-10 shrink-0 rounded-full bg-surface-elevated" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="flex gap-2">
                    <div className="h-4 w-24 rounded bg-surface-elevated" />
                    <div className="h-4 w-16 rounded bg-surface-elevated" />
                  </div>
                  <div className="h-16 w-full max-w-md rounded-lg bg-surface-elevated" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-4 text-center text-content-muted">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated/50">
              <MessageSquare className="h-8 w-8 text-content-muted" />
            </div>
            <div>
              <p className="font-medium text-content-secondary">{emptyTitle}</p>
              <p className="mt-1 max-w-sm text-sm">{emptyDescription}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => {
              const isMe = comment.author.id === user?.id;
              const authorName = comment.author.fullName || comment.author.email || "Unknown";

              return (
                <div key={comment.id} className={cn("flex gap-4", isMe ? "flex-row-reverse" : "flex-row")}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-theme-border bg-surface-elevated font-bold uppercase text-content-secondary">
                    {authorName.charAt(0)}
                  </div>

                  <div className={cn("flex max-w-[80%] flex-col", isMe ? "items-end" : "items-start")}>
                    <div className="mb-1 flex items-baseline gap-2 px-1">
                      <span className="text-sm font-medium text-content-secondary">{isMe ? "You" : authorName}</span>
                      {comment.author.role && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted">
                          {comment.author.role}
                        </span>
                      )}
                      <span className="text-xs text-content-muted">{formatTime(comment.createdAt)}</span>
                    </div>

                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap break-words",
                        isMe
                          ? "rounded-tr-sm border border-theme-accent bg-action-subtle text-theme-accent"
                          : "rounded-tl-sm border border-theme-border bg-surface-elevated text-content-secondary",
                      )}
                    >
                      {comment.content}
                      {comment.attachmentUrls && comment.attachmentUrls.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {comment.attachmentUrls.map((url) => (
                            <button
                              type="button"
                              key={url}
                              onClick={() => downloadAttachment.mutate({ fileUrl: url })}
                              disabled={downloadAttachment.isPending}
                              className="block w-full overflow-hidden rounded-xl border border-theme-border bg-surface-sunken/60 text-left text-xs text-content-secondary transition hover:bg-surface-sunken disabled:opacity-50"
                            >
                              <span className="flex items-center gap-2 px-3 py-2">
                                <Paperclip className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{fileNameFromUrl(url)}</span>
                                <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-content-muted" />
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 border-t border-theme-border bg-surface p-4">
        {uploadedUrls.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {uploadedUrls.map((url) => (
              <span
                key={url}
                className="flex max-w-full items-center gap-1.5 rounded-lg bg-action-subtle px-3 py-1.5 text-xs text-theme-accent ring-1 ring-theme-accent"
              >
                <Paperclip className="h-3 w-3 shrink-0" />
                <span className="max-w-48 truncate">{fileNameFromUrl(url)}</span>
                <button
                  type="button"
                  aria-label="Remove attachment"
                  onClick={() => setUploadedUrls((current) => current.filter((item) => item !== url))}
                  className="rounded-full p-0.5 text-theme-accent hover:bg-action-subtle hover:text-action-primary-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative flex max-w-full items-end gap-3">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
          <button
            type="button"
            aria-label="Attach file"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadAttachment.isPending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-theme-border bg-surface text-content-secondary transition-colors hover:border-theme-accent hover:text-theme-accent disabled:opacity-50"
          >
            {uploadAttachment.isPending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-theme-accent border-t-emerald-400" />
            ) : (
              <Paperclip className="h-5 w-5" />
            )}
          </button>
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment..."
            className="custom-scrollbar min-h-11 max-h-32 flex-1 bg-surface text-content-secondary placeholder:text-content-muted"
            rows={1}
            style={{
              height: content.split("\n").length > 1 ? "auto" : "44px",
              minHeight: "44px",
            }}
          />
          <button
            type="submit"
            aria-label="Send comment"
            disabled={(!content.trim() && uploadedUrls.length === 0) || postComment.isPending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-action-primary text-action-primary-foreground shadow-lg shadow-emerald-900/20 transition-colors hover:bg-action-primary-hover disabled:opacity-50 disabled:hover:bg-action-primary-hover"
          >
            {postComment.isPending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-theme-border border-t-white" />
            ) : (
              <Send className="ml-[-2px] h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
