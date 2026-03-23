export type CommentTargetType = "PROJECT" | "TASK" | "INVOICE";

export interface CommentAuthor {
  id: string;
  fullName?: string;
  email?: string;
  role?: string;
}

export interface CommentItem {
  id: number;
  content: string;
  author: CommentAuthor;
  threadId: number;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetCommentsParams {
  targetType: CommentTargetType;
  targetId: string;
  page?: number;
  size?: number;
}

export interface CreateCommentPayload {
  targetType: CommentTargetType;
  targetId: string;
  content: string;
}
