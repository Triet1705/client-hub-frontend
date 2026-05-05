import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/error";
import { fetchComments, postComment } from "../api/comment.api";
import { uploadAttachment } from "../api/attachment.api";
import type { CommentTargetType } from "../types/comment.types";

export const communicationKeys = {
  all: ["communication"] as const,
  comments: () => [...communicationKeys.all, "comments"] as const,
  commentList: (targetType: CommentTargetType, targetId: string) =>
    [...communicationKeys.comments(), targetType, targetId] as const,
};

export function useCommentsQuery(targetType?: CommentTargetType, targetId?: string) {
  return useQuery({
    queryKey: communicationKeys.commentList(targetType ?? "PROJECT", targetId ?? ""),
    queryFn: () =>
      fetchComments({
        targetType: targetType!,
        targetId: targetId!,
        page: 0,
        size: 100,
      }),
    enabled: Boolean(targetType && targetId),
  });
}

export function usePostCommentMutation(targetType?: CommentTargetType, targetId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, attachmentUrls }: { content: string; attachmentUrls?: string[] }) => {
      if (!targetType || !targetId) {
        throw new Error("No communication target selected.");
      }
      return postComment({ targetType, targetId, content, attachmentUrls });
    },
    onSuccess: () => {
      if (!targetType || !targetId) return;
      queryClient.invalidateQueries({ queryKey: communicationKeys.commentList(targetType, targetId) });
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error, "Unable to send message.");
      toast.error("Send failed", { description: message });
    },
  });
}

export function useUploadAttachmentMutation() {
  return useMutation({
    mutationFn: (file: File) => uploadAttachment(file),
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error, "Unable to upload file.");
      toast.error("Upload failed", { description: message });
    },
  });
}
