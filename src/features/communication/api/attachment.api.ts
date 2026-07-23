import { apiClient } from "@/lib/axios";
import type { CommentTargetType } from "../types/comment.types";

export interface AttachmentResponseDto {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface AttachmentUploadInput {
  file: File;
  targetType: CommentTargetType;
  targetId: string;
}

export async function uploadAttachment({
  file,
  targetType,
  targetId,
}: AttachmentUploadInput): Promise<AttachmentResponseDto> {
  const formData = new FormData();
  formData.append("targetType", targetType);
  formData.append("targetId", targetId);
  formData.append("file", file);

  const { data } = await apiClient.post<AttachmentResponseDto>("/attachments/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}

export async function downloadAttachment(fileUrl: string, suggestedFileName?: string): Promise<void> {
  const protectedUrl =
    /^\/api\/attachments\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!protectedUrl.test(fileUrl)) {
    throw new Error("This legacy attachment is not available through protected download.");
  }

  const requestPath = fileUrl.replace(/^\/api/, "");
  const response = await apiClient.get<Blob>(requestPath, { responseType: "blob" });
  const contentDisposition = response.headers["content-disposition"] as string | undefined;
  const encodedName = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const quotedName = contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1];
  const fileName =
    suggestedFileName ||
    (encodedName ? decodeURIComponent(encodedName) : quotedName) ||
    "attachment";

  const objectUrl = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
