"use client";

import React from "react";
import { ExtractedTask } from "../types/smart-tasks.types";
import { TaskPriority } from "@/features/tasks/types/task.types";
import { Check } from "lucide-react";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { TASK_PRIORITY_OPTIONS } from "@/features/tasks/constants/task-ui.constants";
import { cn } from "@/lib/utils";

interface SmartTaskReviewListProps {
  tasks: ExtractedTask[];
  onTasksChange: (tasks: ExtractedTask[]) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

export function SmartTaskReviewList({
  tasks,
  onTasksChange,
  selectedIds,
  onSelectionChange,
}: SmartTaskReviewListProps) {
  
  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  };

  const updateTask = (id: string, updates: Partial<ExtractedTask>) => {
    onTasksChange(
      tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const isSelected = selectedIds.has(task.id);
        
        return (
          <div 
            key={task.id}
            className={cn(
              "p-5 rounded-2xl border transition-all duration-200",
              isSelected 
                ? "bg-[#111827] border-emerald-500/50 shadow-md shadow-emerald-500/5" 
                : "bg-slate-900/50 border-slate-800 opacity-60 hover:opacity-100"
            )}
          >
            <div className="flex items-start gap-4">
              <button
                onClick={() => toggleSelection(task.id)}
                className={cn(
                  "w-6 h-6 mt-1 rounded border flex items-center justify-center shrink-0 transition-colors",
                  isSelected 
                    ? "bg-emerald-500 border-emerald-500 text-white" 
                    : "border-slate-600 hover:border-emerald-500 text-transparent"
                )}
              >
                <Check className="w-4 h-4" />
              </button>
              
              <div className="flex-1 space-y-4">
                <div>
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => updateTask(task.id, { title: e.target.value })}
                    className={cn(
                      "w-full bg-transparent border-none p-0 text-base font-semibold focus:ring-0 outline-none",
                      isSelected ? "text-emerald-400" : "text-slate-300"
                    )}
                    placeholder="Task Title"
                  />
                </div>
                
                <textarea
                  value={task.description}
                  onChange={(e) => updateTask(task.id, { description: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none custom-scrollbar"
                  placeholder="Task Description"
                />
                
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                      Est. Hours
                    </label>
                    <input
                      type="number"
                      value={task.estimatedHours || ""}
                      onChange={(e) => updateTask(task.id, { estimatedHours: parseFloat(e.target.value) || null })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                      placeholder="0.0"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
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
          </div>
        );
      })}
    </div>
  );
}
