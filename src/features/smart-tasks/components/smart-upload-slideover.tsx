"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Loader2, Check, AlertCircle, ShieldCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadDropzone } from "./upload-dropzone";
import { useExtractTasksMutation } from "../hooks/use-smart-tasks";
import { ExtractedTask } from "../types/smart-tasks.types";
import { TaskRequestPayload, TaskStatus, TaskPriority } from "@/features/tasks/types/task.types";
import { toast } from "sonner";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { TASK_PRIORITY_OPTIONS } from "@/features/tasks/constants/task-ui.constants";
import { createTask } from "@/features/tasks/api/task.api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface SmartUploadSlideoverProps {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onTasksCreated?: () => void;
}

type Phase = "upload" | "extracting" | "review";

interface DocumentMeta {
  summary: string;
  overallConfidence: number;
  reviewPassTriggered: boolean;
  processingTimeMs: number;
}

export function SmartUploadSlideover({
  isOpen,
  projectId,
  onClose,
  onTasksCreated,
}: SmartUploadSlideoverProps) {
  const [phase, setPhase] = useState<Phase>("upload");
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [documentMeta, setDocumentMeta] = useState<DocumentMeta | null>(null);
  
  const [isApprovingAll, setIsApprovingAll] = useState(false);
  const [approvingCount, setApprovingCount] = useState(0);
  
  // Track faded/dismissed cards for unmounting after animation
  const [fadedTaskIds, setFadedTaskIds] = useState<Set<string>>(new Set());

  const { mutate: extractTasks } = useExtractTasksMutation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Reset state when slideover opens
  useEffect(() => {
    if (isOpen) {
      setPhase("upload");
      setExtractedTasks([]);
      setFileName("");
      setError(null);
      setDocumentMeta(null);
      setFadedTaskIds(new Set());
    }
  }, [isOpen]);

  const handleUpload = (file: File) => {
    setFileName(file.name);
    setPhase("extracting");
    setError(null);

    extractTasks(file, {
      onSuccess: (data) => {
        // Map multi-task results to ExtractedTask[]
        const tasks: ExtractedTask[] = (data.tasks || []).map((t, idx) => ({
          id: `temp-${Date.now()}-${idx}`,
          title: t.title,
          description: t.description,
          estimatedHours: t.estimatedHours,
          suggestedPriority: t.priority,
          confidenceScore: t.confidenceScore,
        }));

        setExtractedTasks(tasks);
        setDocumentMeta({
          summary: data.documentSummary,
          overallConfidence: data.overallConfidence,
          reviewPassTriggered: data.reviewPassTriggered,
          processingTimeMs: data.processingTimeMs,
        });
        setPhase("review");
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : "Failed to analyze document");
      },
    });
  };

  const handleClose = () => {
    if (phase === "review" && extractedTasks.length > 0) {
      if (window.confirm(`You have ${extractedTasks.length} unreviewed tasks. Discard?`)) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const updateTask = (id: string, updates: Partial<ExtractedTask>) => {
    setExtractedTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const createTaskApi = async (task: ExtractedTask) => {
    const payload: TaskRequestPayload = {
      projectId,
      title: task.title,
      description: task.description,
      priority: (task.suggestedPriority as TaskPriority) || TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      estimatedHours: task.estimatedHours || undefined,
      assignedToId: user?.role === "FREELANCER" ? user.id : undefined,
    };
    await createTask(payload);
  };

  const handleApprove = async (task: ExtractedTask) => {
    // Optimistic fade
    setFadedTaskIds((prev) => new Set(prev).add(task.id));
    
    try {
      await createTaskApi(task);
      toast.success("Task created ✓");
      
      // Invalidate directly — don't rely on parent callback
      await queryClient.invalidateQueries({ queryKey: ["tasks", "list"] });
      onTasksCreated?.();
      
      // Remove from list after animation
      setTimeout(() => {
        setExtractedTasks((prev) => prev.filter((t) => t.id !== task.id));
      }, 300);
      
    } catch {
      // Revert fade
      setFadedTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
      toast.error("Failed to create task");
    }
  };

  const handleDismiss = (task: ExtractedTask) => {
    setFadedTaskIds((prev) => new Set(prev).add(task.id));
    
    let isUndone = false;
    
    toast("Task dismissed.", {
      action: {
        label: "UNDO",
        onClick: () => {
          isUndone = true;
          setFadedTaskIds((prev) => {
            const next = new Set(prev);
            next.delete(task.id);
            return next;
          });
        },
      },
      duration: 5000,
    });

    setTimeout(() => {
      if (!isUndone) {
        setExtractedTasks((prev) => prev.filter((t) => t.id !== task.id));
      }
    }, 5000); // Clean up after toast expires
  };

  const handleApproveAll = async () => {
    if (extractedTasks.length === 0) return;
    
    setIsApprovingAll(true);
    setApprovingCount(extractedTasks.length);
    
    let successCount = 0;
    
    try {
      for (const task of extractedTasks) {
        setFadedTaskIds((prev) => new Set(prev).add(task.id));
        await createTaskApi(task);
        successCount++;
        setExtractedTasks((prev) => prev.filter((t) => t.id !== task.id));
      }
      toast.success(`${successCount} tasks created successfully!`);
      
      // Await invalidation so refetch is guaranteed to be in-flight before close
      await queryClient.invalidateQueries({ queryKey: ["tasks", "list"] });
      onTasksCreated?.();
      onClose();
    } catch {
      toast.error(`Created ${successCount} tasks. Some failed.`);
      if (successCount > 0) {
        await queryClient.invalidateQueries({ queryKey: ["tasks", "list"] });
        onTasksCreated?.();
      }
    } finally {
      setIsApprovingAll(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      <div className="fixed inset-y-0 right-0 z-[70] w-full max-w-xl bg-[#0c0c0c] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-slate-900/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-space-grotesk font-bold text-white tracking-tight">
              Smart Upload
            </h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative p-6">
          
          {phase === "upload" && (
            <div className="h-full flex flex-col pt-12 space-y-6">
              <div className="text-center space-y-2 mb-4">
                <h3 className="text-xl font-bold text-white">Upload Document</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                  Drag and drop a project brief or requirements PDF. AI will automatically extract tasks for you to review.
                </p>
              </div>
              <UploadDropzone onUpload={handleUpload} isUploading={false} />
            </div>
          )}

          {phase === "extracting" && !error && (
            <div className="h-full flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                <Loader2 className="w-16 h-16 text-emerald-500 animate-spin relative z-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Analyzing Document</h3>
                <p className="text-sm text-emerald-400/80 font-mono">{fileName}</p>
              </div>
              <p className="text-xs text-slate-500 max-w-xs">
                Extracting actionable tasks, estimating effort, and suggesting priorities...
              </p>
            </div>
          )}

          {phase === "extracting" && error && (
            <div className="h-full flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Analysis Failed</h3>
                <p className="text-sm text-red-400/80 max-w-sm">{error}</p>
              </div>
              <div className="flex gap-4 mt-4">
                <button 
                  onClick={() => setPhase("upload")}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {phase === "review" && (
            <div className="space-y-6 animate-in fade-in duration-500 pb-20">
              {/* Document Metadata Panel */}
              {documentMeta && (
                <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-200">Document Summary</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{documentMeta.summary}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {(documentMeta.processingTimeMs / 1000).toFixed(1)}s
                      </span>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        documentMeta.overallConfidence >= 0.7
                          ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                          : documentMeta.overallConfidence >= 0.4
                          ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
                          : "bg-red-500/15 text-red-400 ring-1 ring-red-500/30"
                      )}>
                        {Math.round(documentMeta.overallConfidence * 100)}% Match
                      </span>
                    </div>
                  </div>
                  {documentMeta.reviewPassTriggered && (
                    <div className="flex items-center gap-1.5 text-[10px] text-indigo-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>AI review pass applied — results have been refined</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-slate-300">Review Drafts</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {extractedTasks.length} task{extractedTasks.length !== 1 ? 's' : ''} remaining
                </p>
              </div>

              {extractedTasks.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">All Done!</h3>
                  <p className="text-sm text-slate-400 mb-6">You&apos;ve reviewed all extracted tasks.</p>
                  <button 
                    onClick={onClose}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Close Panel
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {extractedTasks.map((task) => {
                    const isFaded = fadedTaskIds.has(task.id);
                    
                    return (
                      <div 
                        key={task.id}
                        className={cn(
                          "rounded-2xl border border-slate-700 border-dashed bg-slate-800/30 p-5 transition-all duration-300 relative group/card",
                          isFaded ? "opacity-0 translate-x-8 pointer-events-none" : "opacity-100 hover:bg-slate-800/60 hover:border-slate-600"
                        )}
                      >
                        <div className="space-y-3">
                        {/* Title row */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {task.confidenceScore !== undefined && (
                              <span className={cn(
                                "text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0",
                                task.confidenceScore >= 0.7
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : task.confidenceScore >= 0.4
                                  ? "bg-amber-500/15 text-amber-400"
                                  : "bg-red-500/15 text-red-400"
                              )}>
                                {Math.round(task.confidenceScore * 100)}%
                              </span>
                            )}
                            <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 shrink-0">
                              AI DRAFT
                            </span>
                          </div>
                        </div>
                        
                        <div className="pr-12">
                          <input
                            type="text"
                            value={task.title}
                            onChange={(e) => updateTask(task.id, { title: e.target.value })}
                            className="w-full bg-transparent border-none p-0 text-base font-bold text-slate-200 focus:ring-0 outline-none mb-2"
                            placeholder="Task Title"
                          />
                          
                          <textarea
                            value={task.description}
                            onChange={(e) => updateTask(task.id, { description: e.target.value })}
                            rows={2}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-400 focus:ring-1 focus:ring-emerald-500 outline-none resize-none custom-scrollbar mb-4"
                            placeholder="Task Description"
                          />
                          
                          <div className="flex items-center gap-4">
                            <div className="w-24">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                                Est. Hours
                              </label>
                              <input
                                type="number"
                                value={task.estimatedHours || ""}
                                onChange={(e) => updateTask(task.id, { estimatedHours: parseFloat(e.target.value) || null })}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                                placeholder="0.0"
                              />
                            </div>
                            
                            <div className="w-32">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                                Priority
                              </label>
                              <SelectDropdown
                                options={TASK_PRIORITY_OPTIONS}
                                value={task.suggestedPriority as TaskPriority}
                                onChange={(val) => updateTask(task.id, { suggestedPriority: val })}
                              />
                            </div>
                          </div>
                        </div>
                        </div>

                        {/* Action Buttons — right edge, no overlay */}
                        <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 z-10">
                          <button
                            onClick={() => handleApprove(task)}
                            title="Approve & Create"
                            className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all shadow-lg ring-1 ring-emerald-500/30"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDismiss(task)}
                            title="Dismiss Draft"
                            className="w-9 h-9 rounded-lg bg-slate-800 text-slate-400 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all shadow-lg ring-1 ring-white/10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed Footer Bar — Approve All */}
        {phase === "review" && extractedTasks.length > 0 && (
          <div className="px-6 py-4 border-t border-white/10 bg-slate-900/80 backdrop-blur-xl shrink-0 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              {extractedTasks.length} task{extractedTasks.length !== 1 ? 's' : ''} ready to approve
            </p>
            <button
              onClick={handleApproveAll}
              disabled={isApprovingAll}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/30"
            >
              {isApprovingAll ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating {approvingCount}...</>
              ) : (
                <><Check className="w-4 h-4" /> Approve All</>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
