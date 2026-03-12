import { PageResponse } from "@/features/projects/types/project.types";

export enum TaskStatus {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    DONE = "DONE",
    CANCELLED = "CANCELLED",
}

export enum TaskPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT",
}

export interface UserSummary {
  id: string;
  email: string;
  role: string;
}

export interface Task {
  id: string; // UUID
  title: string;
  description?: string;
  
  projectId: string; // UUID
  projectTitle: string;
  
  assignedTo?: UserSummary; 
  
  status: TaskStatus;
  priority: TaskPriority;
  
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string; 
  
  createdAt: string; 
  updatedAt: string;
}

export interface TaskRequestPayload {
  projectId: string;
  title: string;
  description?: string;
  assignedToId?: string;
  priority: TaskPriority;
  status?: TaskStatus;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
}

export interface FetchTasksParams {
  projectId?: string;
  status?: TaskStatus;
  assignedToId?: string;
  page?: number;
  size?: number;
}

export type TaskPageResponse = PageResponse<Task>;