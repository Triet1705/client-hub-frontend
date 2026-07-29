"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FileUp, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  usePostCommentMutation,
  useUploadAttachmentMutation,
} from "@/features/communication/hooks/use-communication";
import { cn } from "@/lib/utils";
import { projectKeys } from "../hooks/use-projects";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

interface ProjectFileUploadZoneProps {
  projectId: string;
}

function validateFiles(files: File[]) {
  const oversized = files.find((file) => file.size > MAX_FILE_SIZE);
  if (oversized) {
    return `${oversized.name} exceeds the 5MB file limit.`;
  }

  const unsupported = files.find((file) => !ALLOWED_FILE_TYPES.has(file.type));
  if (unsupported) {
    return `${unsupported.name} is not a supported PDF, Word, JPEG, PNG, or GIF file.`;
  }

  return null;
}

export function ProjectFileUploadZone({ projectId }: ProjectFileUploadZoneProps) {
  const queryClient = useQueryClient();
  const uploadAttachment = useUploadAttachmentMutation();
  const postComment = usePostCommentMutation("PROJECT", projectId);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [uploadCount, setUploadCount] = React.useState(0);
  const isUploading = uploadCount > 0;

  const uploadFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0 || isUploading) return;

    const validationError = validateFiles(files);
    if (validationError) {
      toast.error("Upload rejected", { description: validationError });
      return;
    }

    setUploadCount(files.length);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const uploaded = await uploadAttachment.mutateAsync({
          file,
          targetType: "PROJECT",
          targetId: projectId,
        });
        uploadedUrls.push(uploaded.fileUrl);
      }

      await postComment.mutateAsync({
        content: files.length === 1
          ? `Shared ${files[0]?.name ?? "a file"} from Project Files`
          : `Shared ${files.length} files from Project Files`,
        attachmentUrls: uploadedUrls,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: projectKeys.files(projectId) }),
        queryClient.invalidateQueries({ queryKey: projectKeys.activity(projectId) }),
      ]);
      toast.success(files.length === 1 ? "File uploaded" : `${files.length} files uploaded`);
    } catch {
      // Mutation hooks surface the API error; keep the event handler rejection contained.
    } finally {
      setUploadCount(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault();
        if (!isUploading) setIsDragActive(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        event.preventDefault();
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setIsDragActive(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragActive(false);
        void uploadFiles(event.dataTransfer.files);
      }}
      className={cn(
        "rounded-2xl border border-dashed p-6 transition-colors",
        isDragActive
          ? "border-emerald-400 bg-emerald-500/10"
          : "border-white/15 bg-slate-900/40 hover:border-emerald-500/30",
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,image/jpeg,image/png,image/gif"
        className="hidden"
        onChange={(event) => {
          if (event.target.files) void uploadFiles(event.target.files);
        }}
      />
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">
          {isUploading ? (
            <FileUp className="h-6 w-6 animate-pulse" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">
            {isUploading ? `Uploading ${uploadCount} file${uploadCount === 1 ? "" : "s"}...` : "Drop files here"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            PDF, Word, JPEG, PNG, or GIF. Up to 5MB per file. Uploads are recorded in project messages.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          isLoading={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/10"
        >
          Choose files
        </Button>
      </div>
    </div>
  );
}
