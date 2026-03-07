import { apiClient } from "@/lib/axios";
import type { Project, ProjectRequestPayload, PageResponse } from "../types/project.types";

const PROJECTS_BASE = "/projects";

export async function fetchProjects(page = 0, size = 20): Promise<PageResponse<Project>> {
  const { data } = await apiClient.get<PageResponse<Project>>(PROJECTS_BASE, {
    params: { page, size, sort: "createdAt,desc" },
  });
  return data;
}

export async function fetchProjectById(id: string): Promise<Project> {
  const { data } = await apiClient.get<Project>(`${PROJECTS_BASE}/${id}`);
  return data;
}

export async function createProject(payload: ProjectRequestPayload): Promise<Project> {
  const { data } = await apiClient.post<Project>(PROJECTS_BASE, payload);
  return data;
}

export async function updateProject(id: string, payload: ProjectRequestPayload): Promise<Project> {
  const { data } = await apiClient.put<Project>(`${PROJECTS_BASE}/${id}`, payload);
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`${PROJECTS_BASE}/${id}`);
}