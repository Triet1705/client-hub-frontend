"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileText, Loader2, Sparkles } from "lucide-react";
import { useSmartTasksHistory } from "@/features/smart-tasks/hooks/use-smart-tasks-history";
import { SmartTaskReviewList } from "@/features/smart-tasks/components/smart-task-review-list";
import { ExtractedTask } from "@/features/smart-tasks/types/smart-tasks.types";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects";
import { useCreateTaskMutation } from "@/features/tasks/hooks/use-tasks";
import { TaskStatus } from "@/features/tasks/types/task.types";
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import { TaskRequestPayload } from "@/features/tasks/types/task.types";

export default function SmartTasksReviewPage() {
  const router = useRouter();
  const params = useParams();
  const fileId = params.fileId as string;
  
  const { history } = useSmartTasksHistory();
  const [historyItem, setHistoryItem] = useState(history.find(h => h.id === fileId));
  
  const [tasks, setTasks] = useState<ExtractedTask[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: projectsData, isLoading: isLoadingProjects } = useProjectsQuery();

  useEffect(() => {
    const item = history.find(h => h.id === fileId);
    if (item) {
      setHistoryItem(item);
      if (item.extractedTasks && tasks.length === 0) {
        setTasks(item.extractedTasks);
        setSelectedIds(new Set(item.extractedTasks.map(t => t.id)));
      }
    }
  }, [history, fileId, tasks.length]);

  if (!historyItem) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-slate-400">Loading analysis...</p>
      </div>
    );
  }

  if (historyItem.status === "error") {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Analysis Failed</h1>
        <p className="text-slate-400">{historyItem.error}</p>
        <button 
          onClick={() => router.push("/smart-tasks")}
          className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleSelectAll = () => {
    if (selectedIds.size === tasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tasks.map(t => t.id)));
    }
  };

  const handleCreateTasks = async () => {
    if (!selectedProjectId) {
      toast.error("Please select a project first");
      return;
    }

    if (selectedIds.size === 0) {
      toast.error("Please select at least one task to create");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const selectedTasks = tasks.filter(t => selectedIds.has(t.id));
      
      // Create tasks sequentially to avoid overwhelming the API
      for (const task of selectedTasks) {
        const payload: TaskRequestPayload = {
          projectId: selectedProjectId,
          title: task.title,
          description: task.description,
          priority: task.suggestedPriority as any,
          status: TaskStatus.TODO,
          estimatedHours: task.estimatedHours || undefined,
        };
        
        await apiClient.post("/api/tasks", payload);
      }
      
      toast.success(`Successfully created ${selectedTasks.length} tasks!`);
      router.push(`/projects/${selectedProjectId}`);
      
    } catch (error) {
      console.error("Failed to create tasks:", error);
      toast.error("Failed to create some tasks. Please try again.");
      setIsSubmitting(false);
    }
  };

  const projectOptions = projectsData?.content.map(p => ({
    value: p.id,
    label: p.name
  })) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/smart-tasks")}
            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Review AI Tasks
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Select and adjust the extracted tasks before saving them to your project.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-64">
            <SelectDropdown
              options={[
                { value: "", label: "Select Project..." },
                ...projectOptions
              ]}
              value={selectedProjectId}
              onChange={setSelectedProjectId}
              placeholder="Select Target Project"
            />
          </div>
          <button
            onClick={handleCreateTasks}
            disabled={isSubmitting || selectedIds.size === 0 || !selectedProjectId}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/20"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            Create {selectedIds.size} Tasks
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 sticky top-24">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
              Document Context
            </h2>
            
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-200 truncate" title={historyItem.fileName}>
                  {historyItem.fileName}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Analyzed on {new Date(historyItem.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Total Found</span>
                <span className="font-bold text-white">{tasks.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Selected</span>
                <span className="font-bold text-emerald-400">{selectedIds.size}</span>
              </div>
              
              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleSelectAll}
                  className="w-full py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  {selectedIds.size === tasks.length ? "Deselect All" : "Select All"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <SmartTaskReviewList 
            tasks={tasks}
            onTasksChange={setTasks}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </div>
      </div>
    </div>
  );
}
