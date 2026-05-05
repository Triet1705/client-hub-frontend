import { apiClient } from "@/lib/axios";

export interface AttachmentResponseDto {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
}

export async function uploadAttachment(file: File): Promise<AttachmentResponseDto> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<AttachmentResponseDto>("/attachments/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}
