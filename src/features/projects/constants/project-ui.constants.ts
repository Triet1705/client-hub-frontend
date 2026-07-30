import { ProjectStatus } from "../types/project.types";

export const PROJECT_STATUS_BADGE: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]:   "text-content-secondary bg-surface-sunken/50 border-theme-border/40",
  [ProjectStatus.IN_PROGRESS]:"text-theme-accent bg-action-subtle border-theme-accent",
  [ProjectStatus.ON_HOLD]:    "text-status-warning-text bg-status-warning-surface border-status-warning-border",
  [ProjectStatus.COMPLETED]:  "text-status-info-text bg-status-info-surface border-status-info-border",
  [ProjectStatus.CANCELLED]:  "text-status-danger-text bg-status-danger-surface border-status-danger-border",
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]:   "Planning",
  [ProjectStatus.IN_PROGRESS]:"Active",
  [ProjectStatus.ON_HOLD]:    "On Hold",
  [ProjectStatus.COMPLETED]:  "Completed",
  [ProjectStatus.CANCELLED]:  "Cancelled",
};
