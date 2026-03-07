"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

import { useCreateProjectMutation } from "../hooks/use-projects";
import {
  projectSchema,
  type ProjectFormValues,
  type ProjectFormInputValues,
} from "../validations/project.schema";
import { ProjectStatus } from "../types/project.types";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { mutate: createProject, isPending } = useCreateProjectMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormInputValues, unknown, ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: "",
      deadline: "",
      status: ProjectStatus.PLANNING,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isPending]);

  const onSubmit = (data: ProjectFormValues) => {
    createProject(data, {
      onSuccess: () => {
        handleClose(); 
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-project-title"
    >
      <div
        className="absolute inset-0 backdrop-blur-md bg-black/60"
        onClick={isPending ? undefined : handleClose}
      />

      <div className="relative w-full max-w-xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between">
          <h3 id="create-project-title" className="text-xl font-bold text-white tracking-tight font-sans">
            Create New Project
          </h3>
          <button 
            onClick={handleClose}
            disabled={isPending}
            className="text-slate-500 hover:text-white transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form id="create-project-form" onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input 
              {...register("title")}
              className={cn(
                "w-full bg-slate-900/50 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all",
                errors.title ? "border-rose-500 focus:border-rose-500" : "border-slate-700 focus:border-emerald-500"
              )}
              placeholder="e.g. Mobile App Redesign" 
              type="text"
            />
            {errors.title && <p className="text-[11px] text-rose-400 mt-1">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Description
            </label>
            <textarea 
              {...register("description")}
              className={cn(
                "w-full bg-slate-900/50 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none",
                errors.description ? "border-rose-500" : "border-slate-700 focus:border-emerald-500"
              )}
              placeholder="Provide a brief overview of the project..." 
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Budget (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">
                  $
                </span>
                <input
                  {...register("budget")}
                  className={cn(
                    "w-full bg-slate-900/50 border rounded-xl pl-8 pr-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all",
                    errors.budget ? "border-rose-500" : "border-slate-700 focus:border-emerald-500"
                  )}
                  placeholder="0.00"
                  type="text"
                  inputMode="decimal"
                />
              </div>
              {errors.budget && <p className="text-[11px] text-rose-400 mt-1">{errors.budget.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Deadline
              </label>
              <input 
                {...register("deadline")}
                className={cn(
                  "w-full bg-slate-900/50 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all [color-scheme:dark]",
                  errors.deadline ? "border-rose-500" : "border-slate-700 focus:border-emerald-500"
                )}
                type="date"
              />
              {errors.deadline && <p className="text-[11px] text-rose-400 mt-1">{errors.deadline.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Initial Status
            </label>
            <select 
              {...register("status")}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
            >
              <option value={ProjectStatus.PLANNING}>Planning</option>
              <option value={ProjectStatus.IN_PROGRESS}>In Progress</option>
              <option value={ProjectStatus.ON_HOLD}>On Hold</option>
            </select>
          </div>
        </form>

        <div className="px-8 py-6 bg-slate-900/30 border-t border-slate-800 flex items-center justify-end gap-3">
          <button 
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button 
            type="submit"
            form="create-project-form" 
            disabled={isPending}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Provisioning...
              </>
            ) : (
              "Create Project"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}