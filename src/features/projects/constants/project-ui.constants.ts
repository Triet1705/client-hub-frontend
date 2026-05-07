import { ProjectStatus } from "../types/project.types";

export const PROJECT_STATUS_BADGE: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]:   "text-slate-300 bg-slate-700/50 border-slate-600/40",
  [ProjectStatus.IN_PROGRESS]:"text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  [ProjectStatus.ON_HOLD]:    "text-amber-400 bg-amber-400/10 border-amber-400/20",
  [ProjectStatus.COMPLETED]:  "text-blue-400 bg-blue-400/10 border-blue-400/20",
  [ProjectStatus.CANCELLED]:  "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]:   "Planning",
  [ProjectStatus.IN_PROGRESS]:"Active",
  [ProjectStatus.ON_HOLD]:    "On Hold",
  [ProjectStatus.COMPLETED]:  "Completed",
  [ProjectStatus.CANCELLED]:  "Cancelled",
};
