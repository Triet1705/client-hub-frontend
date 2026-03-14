import { apiClient } from "@/lib/axios";
import type {
  Project,
  ProjectRequestPayload,
  PageResponse,
  ProjectMember,
  ProjectInvoice,
  ProjectFreelancerCandidate,
} from "../types/project.types";

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

// Project members — F6 direct-add model (backend: GET/POST/DELETE /api/projects/{id}/members)
export async function fetchProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const { data } = await apiClient.get<ProjectMember[]>(`${PROJECTS_BASE}/${projectId}/members`);
  return data;
}

export async function addProjectMember(projectId: string, userId: string): Promise<ProjectMember> {
  const { data } = await apiClient.post<ProjectMember>(`${PROJECTS_BASE}/${projectId}/members`, { userId });
  return data;
}

export async function removeProjectMember(projectId: string, userId: string): Promise<void> {
  await apiClient.delete(`${PROJECTS_BASE}/${projectId}/members/${userId}`);
}

export async function searchProjectFreelancers(
  projectId: string,
  keyword: string,
): Promise<ProjectFreelancerCandidate[]> {
  const trimmedKeyword = keyword.trim();
  const { data } = await apiClient.get<ProjectFreelancerCandidate[]>(
    `${PROJECTS_BASE}/${projectId}/freelancers/search`,
    { params: { keyword: trimmedKeyword || undefined } },
  );
  return data;
}

// Project invoices — reuses existing GET /invoices?projectId= endpoint (§7.2)
export async function fetchProjectInvoices(projectId: string): Promise<ProjectInvoice[]> {
  const { data } = await apiClient.get<PageResponse<ProjectInvoice> | ProjectInvoice[] | null>("/invoices", {
    params: { projectId, size: 20 },
  });

  if (Array.isArray(data)) {
    return data;
  }

  return data?.content ?? [];
}
