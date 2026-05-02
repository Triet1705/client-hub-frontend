"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles, History, FileText, CheckCircle2, XCircle, Clock } from "lucide-react";
import { UploadDropzone } from "@/features/smart-tasks/components/upload-dropzone";
import { useSmartTasksHistory } from "@/features/smart-tasks/hooks/use-smart-tasks-history";
import { useExtractTasksMutation } from "@/features/smart-tasks/hooks/use-smart-tasks";
import { useRouter } from "next/navigation";

export default function SmartTasksPage() {
  const router = useRouter();
  const { history, addHistoryItem, updateHistoryItem } = useSmartTasksHistory();
  const { mutate: extractTasks, isPending } = useExtractTasksMutation();

  const handleUpload = (file: File) => {
    // Generate temporary ID
    const historyId = crypto.randomUUID();
    
    // Create optimistic history item
    addHistoryItem({
      id: historyId,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      status: "processing",
    });

    extractTasks(file, {
      onSuccess: (data) => {
        updateHistoryItem(historyId, {
          status: "completed",
          extractedTasks: data.extractedTasks.map((t, index) => ({
            id: `temp-${index}`,
            title: t.title,
            description: t.description,
            estimatedHours: t.estimatedHours,
            suggestedPriority: t.suggestedPriority,
          })),
        });
        router.push(`/smart-tasks/review/${historyId}`);
      },
      onError: (error) => {
        updateHistoryItem(historyId, {
          status: "error",
          error: error instanceof Error ? error.message : "Failed to extract tasks",
        });
      },
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "error": return <XCircle className="w-4 h-4 text-red-400" />;
      case "processing": return <Clock className="w-4 h-4 text-blue-400" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Smart Tasks Intake</h1>
            <p className="text-sm text-slate-400 mt-1">
              Upload project scope documents or briefs to auto-generate task tickets.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 shadow-xl shadow-black/20">
            <h2 className="text-lg font-medium text-slate-200 mb-6">New Document Analysis</h2>
            <UploadDropzone onUpload={handleUpload} isUploading={isPending} />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 flex flex-col h-[500px]">
            <div className="flex items-center gap-2 mb-6 text-slate-300">
              <History className="w-5 h-5 text-slate-500" />
              <h2 className="font-medium">Recent Extractions</h2>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-slate-600" />
                  </div>
                  <p className="text-sm">No history yet.<br/>Upload a document to begin.</p>
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.status === "completed") {
                        router.push(`/smart-tasks/review/${item.id}`);
                      }
                    }}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-colors",
                      item.status === "completed" 
                        ? "border-slate-800 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-700 cursor-pointer"
                        : "border-slate-800 bg-slate-900/50 opacity-70 cursor-default"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getStatusIcon(item.status)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{item.fileName}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(item.uploadedAt).toLocaleDateString()}
                          {item.extractedTasks && ` • ${item.extractedTasks.length} tasks`}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
