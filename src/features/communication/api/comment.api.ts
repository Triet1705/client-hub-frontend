import { apiClient } from "@/lib/axios";
import type { PageResponse } from "@/lib/type";
import type { CommentItem, CreateCommentPayload, GetCommentsParams } from "../types/comment.types";

const COMMENTS_BASE = "/comments";

export async function fetchComments(params: GetCommentsParams): Promise<CommentItem[]> {
  const { data } = await apiClient.get<PageResponse<CommentItem>>(COMMENTS_BASE, {
    params: {
      targetType: params.targetType,
      targetId: params.targetId,
      page: params.page ?? 0,
      size: params.size ?? 100,
    },
  });

  if (Array.isArray((data as unknown as { content?: unknown[] })?.content)) {
    return (data as unknown as { content: CommentItem[] }).content;
  }

  return [];
}

export async function postComment(payload: CreateCommentPayload): Promise<CommentItem> {
  const { data } = await apiClient.post<CommentItem>(COMMENTS_BASE, payload);
  return data;
}
