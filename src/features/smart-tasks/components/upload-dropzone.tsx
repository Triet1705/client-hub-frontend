"use client";

import React, { useState, useRef, useCallback } from "react";
import { UploadCloud, FileType, AlertCircle, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onUpload: (file: File) => void;
  isUploading?: boolean;
}

export function UploadDropzone({ onUpload, isUploading }: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const validateFile = (file: File): boolean => {
    setError(null);
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError("File is too large. Maximum size is 10MB.");
      return false;
    }
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleStartExtraction = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept=".pdf"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200",
            isDragOver
              ? "border-theme-accent bg-action-subtle"
              : "border-theme-border bg-surface/50 hover:border-theme-border hover:bg-surface-elevated/50"
          )}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
              isDragOver ? "bg-action-subtle text-theme-accent" : "bg-surface-elevated text-content-secondary"
            )}>
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-medium text-content-secondary">
                Upload Project Document
              </h3>
              <p className="text-sm text-content-muted">
                Drag and drop your PDF here, or click to browse
              </p>
            </div>

            <div className="text-xs text-content-muted font-medium">
              Supported formats: PDF (Max 10MB)
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-theme-border bg-surface/50 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-status-danger-surface text-status-danger-text flex items-center justify-center shrink-0">
              <FileType className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-content-secondary truncate">
                {selectedFile.name}
              </h4>
              <p className="text-xs text-content-muted">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={handleClear}
              disabled={isUploading}
              className="p-2 text-content-secondary hover:text-content-secondary hover:bg-surface-elevated rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleStartExtraction}
            disabled={isUploading}
            className="w-full py-3 bg-action-primary hover:bg-action-primary-hover text-action-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:hover:bg-action-primary-hover"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Extracting AI Tasks...
              </>
            ) : (
              "Extract Tasks with AI"
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-status-danger-surface border border-status-danger-border flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-status-danger-text shrink-0 mt-0.5" />
          <p className="text-sm text-status-danger-text">{error}</p>
        </div>
      )}
    </div>
  );
}
