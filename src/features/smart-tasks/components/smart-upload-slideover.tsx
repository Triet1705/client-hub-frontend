"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Loader2, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadDropzone } from "./upload-dropzone";
import { useExtractTasksMutation } from "../hooks/use-smart-tasks";
import { ExtractedTask } from "../types/smart-tasks.types";
import { TaskRequestPayload, TaskStatus, TaskPriority } from "@/features/tasks/types/task.types";
import { toast } from "sonner";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { TASK_PRIORITY_OPTIONS } from "@/features/tasks/constants/task-ui.constants";
import { createTask } from "@/features/tasks/api/task.api";

interface SmartUploadSlideoverProps {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onTasksCreated?: () => void;
}

type Phase = "upload" | "extracting" | "review";

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
  const [documentMetadata, setDocumentMetadata] = useState<{ summary: string; confidence: number; reviewed: boolean; time?: number } | null>(null);
  
  const [isApprovingAll, setIsApprovingAll] = useState(false);
  const [approvingCount, setApprovingCount] = useState(0);
  
  // Track faded/dismissed cards for unmounting after animation
  const [fadedTaskIds, setFadedTaskIds] = useState<Set<string>>(new Set());

  const { mutate: extractTasks } = useExtractTasksMutation();

  // Reset state when slideover opens
  useEffect(() => {
    if (isOpen) {
      setPhase("upload");
      setExtractedTasks([]);
      setFileName("");
      setError(null);
      setDocumentMetadata(null);
      setFadedTaskIds(new Set());
    }
  }, [isOpen]);

  const handleUpload = (file: File) => {
    setFileName(file.name);
    setPhase("extracting");
    setError(null);

    extractTasks(file, {
      onSuccess: (data) => {
        const mappedTasks = data.tasks.map((task, index) => ({
          id: `temp-${Date.now()}-${index}`,
          title: task.title,
          description: task.description,
          estimatedHours: task.estimatedHours,
          suggestedPriority: task.priority,
          confidenceScore: task.confidenceScore,
        }));
        setExtractedTasks(mappedTasks);
        setDocumentMetadata({
          summary: data.documentSummary,
          confidence: data.overallConfidence,
          reviewed: data.reviewPassTriggered,
          time: data.processingTimeMs
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
    };
    await createTask(payload);
  };

  const handleApprove = async (task: ExtractedTask) => {
    // Optimistic fade
    setFadedTaskIds((prev) => new Set(prev).add(task.id));
    
    try {
      await createTaskApi(task);
      toast.success("Task created ✓");
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
      onTasksCreated?.();
      onClose();
    } catch {
      toast.error(`Created ${successCount} tasks. Some failed.`);
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
              <div className="flex items-center justify-between sticky top-0 z-10 bg-[#0c0c0c]/90 backdrop-blur-md py-2 -mt-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-300">Review Drafts</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {extractedTasks.length} task{extractedTasks.length !== 1 ? 's' : ''} remaining
                  </p>
                </div>
                {extractedTasks.length > 0 && (
                  <button
                    onClick={handleApproveAll}
                    disabled={isApprovingAll}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isApprovingAll ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating {approvingCount}...</>
                    ) : (
                      <><Check className="w-3.5 h-3.5" /> Approve All</>
                    )}
                  </button>
                )}
              </div>

              {documentMetadata && (
                <div className="mb-2 p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-300">Document Summary</h4>
                    <div className="flex items-center gap-2">
                      {documentMetadata.time && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {documentMetadata.time / 1000}s
                        </span>
                      )}
                      {documentMetadata.reviewed && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Review Pass Applied
                        </span>
                      )}
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded",
                        documentMetadata.confidence >= 0.8 ? "bg-emerald-500/10 text-emerald-400" :
                        documentMetadata.confidence >= 0.65 ? "bg-yellow-500/10 text-yellow-400" :
                        "bg-red-500/10 text-red-400"
                      )}>
                        {Math.round(documentMetadata.confidence * 100)}% Match
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{documentMetadata.summary}</p>
                </div>
              )}

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
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          <span className={cn(
                            "text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border",
                            task.confidenceScore >= 0.7 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" :
                            task.confidenceScore >= 0.4 ? "border-amber-500/30 bg-amber-500/10 text-amber-300" :
                            "border-red-500/30 bg-red-500/10 text-red-300"
                          )}>
                            {Math.round((task.confidenceScore || 0) * 100)}%
                          </span>
                          <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
                            AI DRAFT
                          </span>
                        </div>
                        
                        <div className="pr-20">
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
      </div>
    </>
  );
}
